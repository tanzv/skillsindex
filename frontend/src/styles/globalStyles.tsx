import { Global, css } from "@emotion/react";

import { globalAccountWorkbenchStyles } from "./globalStyles.accountWorkbench";
import { globalBaseStyles } from "./globalStyles.base";
import { globalLoginStyles } from "./globalStyles.login";
import { globalWorkbenchStyles } from "./globalStyles.workbench";

const globalStyles = css`
${globalBaseStyles}
${globalLoginStyles}
${globalWorkbenchStyles}
${globalAccountWorkbenchStyles}
`;

export default function AppGlobalStyles() {
  return <Global styles={globalStyles} />;
}
