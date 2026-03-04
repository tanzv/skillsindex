import { Breadcrumb } from "antd";

interface SkillDetailBreadcrumbItem {
  key: string;
  label: string;
  onClick?: () => void;
}

interface PublicSkillDetailBreadcrumbProps {
  items: SkillDetailBreadcrumbItem[];
}

export default function PublicSkillDetailBreadcrumb({ items }: PublicSkillDetailBreadcrumbProps) {
  return (
    <nav className="skill-detail-breadcrumb" aria-label="Skill detail breadcrumb">
      <Breadcrumb
        separator="/"
        items={items.map((item) => ({
          key: item.key,
          title: item.onClick ? (
            <button
              type="button"
              className="skill-detail-breadcrumb-button"
              data-testid={`skill-detail-breadcrumb-${item.key}`}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ) : (
            <span className="skill-detail-breadcrumb-current" data-testid={`skill-detail-breadcrumb-${item.key}`}>
              {item.label}
            </span>
          )
        }))}
      />
    </nav>
  );
}
