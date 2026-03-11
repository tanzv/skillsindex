interface LoginPageCopyEntry {
  kicker: string;
  title: string;
  lead: string;
  panelPointOne: string;
  panelPointTwo: string;
  panelPointThree: string;
  signIn: string;
  note: string;
  divider: string;
  username: string;
  password: string;
  showPassword: string;
  hidePassword: string;
  remember: string;
  forgotPassword: string;
  loginFailed: string;
  dingTalk: string;
  dingTalkEnterprise: string;
  github: string;
  google: string;
  wecom: string;
  moreProviders: string;
  helper: string;
  providerDivider: string;
  createHint: string;
}

export const loginPageCopy: { en: LoginPageCopyEntry; zh: LoginPageCopyEntry } = {
  en: {
    kicker: "",
    title: "Workspace Access",
    lead: "Choose the sign-in method enabled for your organization or workspace account.",
    panelPointOne: "Use enterprise SSO when it is enabled for your organization.",
    panelPointTwo: "Use workspace credentials for locally managed accounts.",
    panelPointThree: "If a method is missing, contact your workspace administrator.",
    signIn: "Sign In",
    note: "Choose enterprise identity sign-in, or use workspace credentials.",
    divider: "Or sign in with workspace credentials",
    username: "Work Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    remember: "Remember me",
    forgotPassword: "Forgot?",
    loginFailed: "Login failed",
    dingTalk: "DingTalk",
    dingTalkEnterprise: "DingTalk Enterprise Login",
    github: "GitHub",
    google: "Google",
    wecom: "WeCom",
    moreProviders: "Other",
    helper: "Login options are controlled in Identity and SSO settings and update in real time.",
    providerDivider: "Available methods (auto from backend config)",
    createHint: "No account? Create one"
  },
  zh: {
    kicker: "",
    title: "\u8bbf\u95ee\u5de5\u4f5c\u533a",
    lead: "\u8bf7\u9009\u62e9\u7ec4\u7ec7\u6216\u5de5\u4f5c\u533a\u4e3a\u4f60\u542f\u7528\u7684\u767b\u5f55\u65b9\u5f0f\u3002",
    panelPointOne: "\u7ec4\u7ec7\u542f\u7528\u540e\u53ef\u4f7f\u7528\u4f01\u4e1a SSO \u767b\u5f55\u3002",
    panelPointTwo: "\u672c\u5730\u7ba1\u7406\u8d26\u53f7\u53ef\u4f7f\u7528\u5de5\u4f5c\u533a\u51ed\u8bc1\u3002",
    panelPointThree: "\u5982\u7f3a\u5c11\u767b\u5f55\u65b9\u5f0f\uff0c\u8bf7\u8054\u7cfb\u5de5\u4f5c\u533a\u7ba1\u7406\u5458\u3002",
    signIn: "\u767b\u5f55",
    note: "\u9009\u62e9\u4f01\u4e1a\u8eab\u4efd\u63d0\u4f9b\u65b9\u767b\u5f55\uff0c\u6216\u4f7f\u7528\u5de5\u4f5c\u533a\u8d26\u53f7\u51ed\u8bc1\u3002",
    divider: "\u6216\u4f7f\u7528\u5de5\u4f5c\u533a\u8d26\u53f7",
    username: "\u5de5\u4f5c\u90ae\u7bb1",
    password: "\u5bc6\u7801",
    showPassword: "\u663e\u793a\u5bc6\u7801",
    hidePassword: "\u9690\u85cf\u5bc6\u7801",
    remember: "\u8bb0\u4f4f\u6211",
    forgotPassword: "\u5fd8\u8bb0\uff1f",
    loginFailed: "\u767b\u5f55\u5931\u8d25",
    dingTalk: "\u9489\u9489",
    dingTalkEnterprise: "\u9489\u9489\u4f01\u4e1a\u767b\u5f55",
    github: "GitHub",
    google: "Google",
    wecom: "\u4f01\u4e1a\u5fae\u4fe1",
    moreProviders: "\u5176\u4ed6",
    helper: "\u767b\u5f55\u65b9\u5f0f\u7531\u540e\u53f0\u300c\u8eab\u4efd\u4e0eSSO\u300d\u914d\u7f6e\u4e2d\u5fc3\u63a7\u5236\uff0c\u542f\u7528\u540e\u4f1a\u5b9e\u65f6\u5c55\u793a\u3002",
    providerDivider: "\u53ef\u7528\u767b\u5f55\u65b9\u5f0f\uff08\u6309\u540e\u53f0\u914d\u7f6e\u81ea\u52a8\u663e\u793a\uff09",
    createHint: "\u6ca1\u6709\u8d26\u53f7\uff1f\u521b\u5efa\u4e00\u4e2a"
  }
};
