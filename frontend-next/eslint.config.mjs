import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      ".next.bak-*/**",
      "test-results/**",
      "tmp-screens/**"
    ]
  },
  ...nextCoreWebVitals,
  ...nextTypeScript
];

export default config;
