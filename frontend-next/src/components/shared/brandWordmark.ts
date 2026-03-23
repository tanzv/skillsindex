export function resolveBrandWordmarkSrc(isLightTheme: boolean) {
  return isLightTheme ? "/brand/skillsindex-wordmark-dark.svg" : "/brand/skillsindex-wordmark-light.svg";
}

export function resolveBrandWordmarkAlt(brandTitle: string) {
  return `${brandTitle} wordmark`;
}
