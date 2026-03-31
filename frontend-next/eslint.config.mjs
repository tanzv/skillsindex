import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      ".next.bak-*/**",
      "frontend-next/**",
      "test-results/**",
      "tmp/**",
      "tmp-screens/**"
    ]
  },
  ...nextCoreWebVitals,
  ...nextTypeScript
];

export default config;
