interface LoginPageCopyEntry {
  kicker: string;
  title: string;
  lead: string;
  signIn: string;
  note: string;
  divider: string;
  username: string;
  password: string;
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
    kicker: "Enterprise Intranet - SkillOps",
    title: "Internal Skill Access",
    lead: "",
    signIn: "Sign In",
    note: "Choose enterprise identity sign-in, or use workspace credentials.",
    divider: "Or sign in with workspace credentials",
    username: "Work Email",
    password: "Password",
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
    kicker: "\u4f01\u4e1a\u5185\u7f51 \u00b7 SkillOps",
    title: "\u4f01\u4e1a\u5185\u90e8\u6280\u80fd\u767b\u5f55\u5165\u53e3",
    lead: "",
    signIn: "\u767b\u5f55",
    note: "\u9009\u62e9\u4f01\u4e1a\u8eab\u4efd\u63d0\u4f9b\u65b9\u767b\u5f55\uff0c\u6216\u4f7f\u7528\u5de5\u4f5c\u533a\u8d26\u53f7\u51ed\u8bc1\u3002",
    divider: "\u6216\u4f7f\u7528\u5de5\u4f5c\u533a\u8d26\u53f7",
    username: "\u5de5\u4f5c\u90ae\u7bb1",
    password: "\u5bc6\u7801",
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
