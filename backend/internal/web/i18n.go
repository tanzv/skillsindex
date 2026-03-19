package web

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

type translationCatalog map[string]map[string]string

func loadTranslations(dir string) translationCatalog {
	catalog := translationCatalog{
		"en": defaultEnglishTranslations(),
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return catalog
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(strings.ToLower(entry.Name()), ".json") {
			continue
		}

		localeToken := strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name()))
		locale, ok := parseLocale(localeToken)
		if !ok {
			continue
		}

		raw, err := os.ReadFile(filepath.Join(dir, entry.Name()))
		if err != nil {
			continue
		}
		pairs := make(map[string]string)
		if err := json.Unmarshal(raw, &pairs); err != nil {
			continue
		}
		if _, exists := catalog[locale]; !exists {
			catalog[locale] = make(map[string]string)
		}
		for key, value := range pairs {
			trimmedKey := strings.TrimSpace(key)
			if trimmedKey == "" {
				continue
			}
			catalog[locale][trimmedKey] = value
		}
	}

	return catalog
}

func (c translationCatalog) translate(locale string, key string) string {
	key = strings.TrimSpace(key)
	if key == "" {
		return ""
	}
	normalized := normalizeLocale(locale)
	if values, ok := c[normalized]; ok {
		if text, found := values[key]; found && strings.TrimSpace(text) != "" {
			return text
		}
	}
	if values, ok := c["en"]; ok {
		if text, found := values[key]; found && strings.TrimSpace(text) != "" {
			return text
		}
	}
	return key
}
