function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeSkill(skill) {
  return {
    id: skill.id,
    name: asString(skill.name, "Untitled Skill"),
    description: asString(skill.description, "No description available."),
    content: asString(skill.content, "# Skill\n\nNo content available."),
    category: asString(skill.category, "general"),
    subcategory: asString(skill.subcategory, "general"),
    tags: Array.isArray(skill.tags) ? skill.tags.map((tag) => String(tag)) : [],
    source_type: asString(skill.source_type, "manual"),
    source_url: asString(skill.source_url),
    star_count: asNumber(skill.star_count),
    quality_score: asNumber(skill.quality_score),
    install_command: asString(skill.install_command, "npx skillsindex install example"),
    updated_at: asString(skill.updated_at)
  };
}

function buildSkillReadmeContent(skill) {
  const installCommand =
    asString(skill.install_command) ||
    "Install the skill using the marketplace command available in your environment.";

  return [
    `# ${skill.name}`,
    "",
    "## Overview",
    skill.description,
    "",
    "## Quick Start",
    `- ${installCommand}`,
    "- Review the local SKILL.md file before execution.",
    "- Validate workspace access before enabling automation."
  ].join("\n");
}

function buildSkillChangelogContent(skill) {
  return [
    "# CHANGELOG",
    "",
    "## Latest",
    `- ${skill.updated_at}: Refined marketplace summary and preview metadata.`,
    "- Added dedicated SKILL.md, README.md, and CHANGELOG.md previews.",
    "",
    "## Previous",
    "- Expanded installation guidance for workspace operators.",
    "- Updated resource metadata for repository alignment."
  ].join("\n");
}

function buildSkillResourceFiles(skill) {
  return [
    {
      name: "SKILL.md",
      display_name: "SKILL.md",
      language: "Markdown",
      content: skill.content
    },
    {
      name: "README.md",
      display_name: "README.md",
      language: "Markdown",
      content: buildSkillReadmeContent(skill)
    },
    {
      name: "CHANGELOG.md",
      display_name: "CHANGELOG.md",
      language: "Markdown",
      content: buildSkillChangelogContent(skill)
    }
  ];
}

function getPublicSkills(state) {
  return (state.skills || []).filter((skill) => skill.visibility === "public").map(normalizeSkill);
}

function buildCategoryPayload(skills) {
  const categoryMap = new Map();

  for (const skill of skills) {
    const categoryKey = skill.category || "general";
    const subcategoryKey = skill.subcategory || "general";

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        slug: categoryKey,
        name: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
        description: `${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)} skills available in the marketplace.`,
        count: 0,
        subcategories: new Map()
      });
    }

    const category = categoryMap.get(categoryKey);
    category.count += 1;

    if (!category.subcategories.has(subcategoryKey)) {
      category.subcategories.set(subcategoryKey, {
        slug: subcategoryKey,
        name: subcategoryKey.charAt(0).toUpperCase() + subcategoryKey.slice(1),
        count: 0
      });
    }

    category.subcategories.get(subcategoryKey).count += 1;
  }

  return Array.from(categoryMap.values()).map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    count: category.count,
    subcategories: Array.from(category.subcategories.values())
  }));
}

function buildTopTags(skills) {
  const tagCounts = new Map();

  for (const skill of skills) {
    for (const tag of skill.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 8);
}

function filterSkills(skills, url) {
  const keyword = asString(url.searchParams.get("q")).toLowerCase();
  const category = asString(url.searchParams.get("category")).toLowerCase();
  const subcategory = asString(url.searchParams.get("subcategory")).toLowerCase();
  const sort = asString(url.searchParams.get("sort"), "relevance");

  const filtered = skills.filter((skill) => {
    if (category && skill.category.toLowerCase() !== category) {
      return false;
    }

    if (subcategory && skill.subcategory.toLowerCase() !== subcategory) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    return [skill.name, skill.description, skill.category, skill.subcategory, skill.tags.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  if (sort === "quality") {
    filtered.sort((left, right) => right.quality_score - left.quality_score || right.star_count - left.star_count);
  } else if (sort === "stars") {
    filtered.sort((left, right) => right.star_count - left.star_count || right.quality_score - left.quality_score);
  }

  return filtered;
}

function buildMarketplacePayload(state, url, sessionUser) {
  const publicSkills = getPublicSkills(state);
  const filteredSkills = filterSkills(publicSkills, url);
  const pageSize = Math.max(1, asNumber(url.searchParams.get("page_size"), filteredSkills.length || publicSkills.length || 12));
  const page = Math.max(1, asNumber(url.searchParams.get("page"), 1));
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = filteredSkills.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.max(1, Math.ceil((filteredSkills.length || 1) / pageSize));

  return {
    filters: Object.fromEntries(
      Array.from(url.searchParams.entries()).filter(([, value]) => asString(value).length > 0)
    ),
    stats: {
      total_skills: publicSkills.length,
      matching_skills: filteredSkills.length
    },
    pagination: {
      page,
      page_size: pageSize,
      total_items: filteredSkills.length,
      total_pages: totalPages,
      prev_page: page > 1 ? page - 1 : 0,
      next_page: page < totalPages ? page + 1 : 0
    },
    categories: buildCategoryPayload(publicSkills),
    top_tags: buildTopTags(publicSkills),
    items: paginatedItems,
    session_user: sessionUser,
    can_access_dashboard: Boolean(sessionUser)
  };
}

function getSkillFeedback(state, skillId) {
  if (!state.skillFeedback) {
    state.skillFeedback = {};
  }

  if (!state.skillFeedback[String(skillId)]) {
    state.skillFeedback[String(skillId)] = {
      favorite_count: 0,
      rating_count: 0,
      rating_average: 0,
      viewer_favorited: false,
      viewer_rating: 0,
      comments: []
    };
  }

  return state.skillFeedback[String(skillId)];
}

function buildSkillDetailPayload(state, skillId, sessionUser) {
  const skill = getPublicSkills(state).find((item) => item.id === skillId);
  if (!skill) {
    return null;
  }

  const feedback = getSkillFeedback(state, skillId);

  return {
    skill,
    stats: {
      favorite_count: asNumber(feedback.favorite_count),
      rating_count: asNumber(feedback.rating_count),
      rating_average: asNumber(feedback.rating_average, skill.quality_score),
      comment_count: Array.isArray(feedback.comments) ? feedback.comments.length : 0
    },
    viewer_state: {
      can_interact: Boolean(sessionUser),
      favorited: Boolean(feedback.viewer_favorited),
      rated: asNumber(feedback.viewer_rating) > 0,
      rating: asNumber(feedback.viewer_rating)
    },
    comments: (feedback.comments || []).map((comment) => ({
      id: comment.id,
      username: comment.username,
      display_name: comment.display_name,
      content: comment.content,
      created_at: comment.created_at,
      can_delete: Boolean(sessionUser) && comment.user_id === sessionUser.id
    })),
    comments_limit: 80
  };
}

function buildSkillResourcesPayload(state, skillId) {
  const skill = getPublicSkills(state).find((item) => item.id === skillId);
  if (!skill) {
    return null;
  }
  const files = buildSkillResourceFiles(skill).map((file) => ({
    name: file.name,
    display_name: file.display_name,
    size_bytes: file.content.length,
    size_label: `${file.content.length} B`,
    language: file.language
  }));

  return {
    skill_id: skill.id,
    source_type: skill.source_type,
    source_url: skill.source_url,
    repo_url: skill.source_url,
    source_branch: "main",
    source_path: "SKILL.md",
    install_command: skill.install_command,
    updated_at: skill.updated_at,
    file_count: files.length,
    files
  };
}

function buildSkillResourceContentPayload(state, skillId, requestedPath) {
  const skill = getPublicSkills(state).find((item) => item.id === skillId);
  if (!skill) {
    return null;
  }

  const fileName = asString(requestedPath, "SKILL.md");
  const selectedFile = buildSkillResourceFiles(skill).find((file) => file.name === fileName);
  if (!selectedFile) {
    return null;
  }
  return {
    skill_id: skill.id,
    path: selectedFile.name,
    display_name: selectedFile.display_name,
    language: selectedFile.language,
    size_bytes: selectedFile.content.length,
    size_label: `${selectedFile.content.length} B`,
    content: selectedFile.content,
    updated_at: skill.updated_at
  };
}

function buildSkillVersionsPayload(state, skillId) {
  const skill = getPublicSkills(state).find((item) => item.id === skillId);
  if (!skill) {
    return null;
  }

  return {
    items: [
      {
        id: skill.id * 10 + 1,
        skill_id: skill.id,
        version_number: 3,
        trigger: "sync",
        change_summary: "Aligned summary, tags, and rollout guidance with the latest operating model.",
        risk_level: "low",
        captured_at: "2026-03-10T08:00:00Z",
        actor_username: "system",
        actor_display_name: "System",
        tags: ["sync", "marketplace"],
        changed_fields: ["description", "content"]
      },
      {
        id: skill.id * 10 + 2,
        skill_id: skill.id,
        version_number: 2,
        trigger: "manual",
        change_summary: "Expanded installation and execution notes for operators.",
        risk_level: "medium",
        captured_at: "2026-03-08T14:20:00Z",
        actor_username: "ops.lead",
        actor_display_name: "Ops Lead",
        tags: ["manual"],
        changed_fields: ["install_command", "content"]
      }
    ],
    total: 2
  };
}

function buildComparePayload(state, leftSkillId, rightSkillId) {
  const skills = getPublicSkills(state);
  const leftSkill = skills.find((item) => item.id === leftSkillId);
  const rightSkill = skills.find((item) => item.id === rightSkillId);

  if (!leftSkill || !rightSkill || leftSkill.id === rightSkill.id) {
    return null;
  }

  return {
    left_skill: leftSkill,
    right_skill: rightSkill
  };
}

function nextCommentId(comments) {
  return comments.reduce((max, item) => Math.max(max, asNumber(item.id)), 0) + 1;
}

export async function handlePublicRequest({
  method,
  pathname,
  url,
  request,
  response,
  state,
  json,
  parseJSONBody,
  sessionUser
}) {
  if (method === "GET" && pathname === "/api/v1/public/marketplace") {
    json(response, 200, buildMarketplacePayload(state, url, sessionUser || null));
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/public/skills/compare") {
    const comparePayload = buildComparePayload(state, asNumber(url.searchParams.get("left")), asNumber(url.searchParams.get("right")));
    if (!comparePayload) {
      json(response, 404, { error: "skill_compare_not_found", message: "Requested compare skill pair was not found." });
      return true;
    }

    json(response, 200, comparePayload);
    return true;
  }

  const skillDetailMatch = pathname.match(/^\/api\/v1\/public\/skills\/(\d+)$/);
  if (method === "GET" && skillDetailMatch) {
    const payload = buildSkillDetailPayload(state, asNumber(skillDetailMatch[1]), sessionUser || null);
    if (!payload) {
      json(response, 404, { error: "skill_not_found", message: "Requested public skill was not found." });
      return true;
    }

    json(response, 200, payload);
    return true;
  }

  const skillResourcesMatch = pathname.match(/^\/api\/v1\/public\/skills\/(\d+)\/resources$/);
  if (method === "GET" && skillResourcesMatch) {
    const payload = buildSkillResourcesPayload(state, asNumber(skillResourcesMatch[1]));
    if (!payload) {
      json(response, 404, { error: "skill_resources_not_found", message: "Requested public skill resources were not found." });
      return true;
    }

    json(response, 200, payload);
    return true;
  }

  const skillFileMatch = pathname.match(/^\/api\/v1\/public\/skills\/(\d+)\/resource-file$/);
  if (method === "GET" && skillFileMatch) {
    const payload = buildSkillResourceContentPayload(state, asNumber(skillFileMatch[1]), url.searchParams.get("path"));
    if (!payload) {
      json(response, 404, { error: "skill_resource_not_found", message: "Requested public skill resource file was not found." });
      return true;
    }

    json(response, 200, payload);
    return true;
  }

  const skillVersionsMatch = pathname.match(/^\/api\/v1\/public\/skills\/(\d+)\/versions$/);
  if (method === "GET" && skillVersionsMatch) {
    const payload = buildSkillVersionsPayload(state, asNumber(skillVersionsMatch[1]));
    if (!payload) {
      json(response, 404, { error: "skill_versions_not_found", message: "Requested public skill versions were not found." });
      return true;
    }

    json(response, 200, payload);
    return true;
  }

  const favoriteMatch = pathname.match(/^\/api\/v1\/skills\/(\d+)\/favorite$/);
  if (method === "POST" && favoriteMatch && sessionUser) {
    const feedback = getSkillFeedback(state, asNumber(favoriteMatch[1]));
    const wasFavorited = Boolean(feedback.viewer_favorited);
    feedback.viewer_favorited = !wasFavorited;
    feedback.favorite_count = Math.max(0, asNumber(feedback.favorite_count) + (feedback.viewer_favorited ? 1 : -1));
    json(response, 200, {
      ok: true,
      favorited: feedback.viewer_favorited,
      stats: {
        favorite_count: feedback.favorite_count,
        rating_count: feedback.rating_count,
        rating_average: feedback.rating_average,
        comment_count: Array.isArray(feedback.comments) ? feedback.comments.length : 0
      }
    });
    return true;
  }

  const ratingMatch = pathname.match(/^\/api\/v1\/skills\/(\d+)\/rating$/);
  if (method === "POST" && ratingMatch && sessionUser) {
    const body = await parseJSONBody(request);
    const feedback = getSkillFeedback(state, asNumber(ratingMatch[1]));
    feedback.viewer_rating = Math.max(0, Math.min(5, asNumber(body.score)));
    feedback.rating_count = Math.max(1, asNumber(feedback.rating_count, 1));
    feedback.rating_average = feedback.viewer_rating;
    json(response, 200, {
      ok: true,
      score: feedback.viewer_rating,
      stats: {
        favorite_count: feedback.favorite_count,
        rating_count: feedback.rating_count,
        rating_average: feedback.rating_average,
        comment_count: Array.isArray(feedback.comments) ? feedback.comments.length : 0
      }
    });
    return true;
  }

  const commentsMatch = pathname.match(/^\/api\/v1\/skills\/(\d+)\/comments$/);
  if (method === "POST" && commentsMatch && sessionUser) {
    const body = await parseJSONBody(request);
    const feedback = getSkillFeedback(state, asNumber(commentsMatch[1]));
    const comments = Array.isArray(feedback.comments) ? feedback.comments : [];
    const item = {
      id: nextCommentId(comments),
      skill_id: asNumber(commentsMatch[1]),
      user_id: sessionUser.id,
      username: sessionUser.username,
      display_name: sessionUser.display_name,
      content: asString(body.content, "New comment"),
      created_at: new Date().toISOString()
    };
    feedback.comments = [item, ...comments];
    json(response, 200, { ok: true, comment: item });
    return true;
  }

  const deleteCommentMatch = pathname.match(/^\/api\/v1\/skills\/(\d+)\/comments\/(\d+)\/delete$/);
  if (method === "POST" && deleteCommentMatch && sessionUser) {
    const feedback = getSkillFeedback(state, asNumber(deleteCommentMatch[1]));
    feedback.comments = (feedback.comments || []).filter((comment) => comment.id !== asNumber(deleteCommentMatch[2]));
    json(response, 200, { ok: true, comment_id: asNumber(deleteCommentMatch[2]) });
    return true;
  }

  return false;
}
