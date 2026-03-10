import { Global, css } from "@emotion/react";

import { globalAccountWorkbenchStyles } from "./globalStyles.accountWorkbench";
import { globalBaseStyles } from "./globalStyles.base";
import { globalBackendUserControlStyles } from "./globalStyles.backendUserControl";
import { globalLoginStyles } from "./globalStyles.login";
import { globalWorkbenchStyles } from "./globalStyles.workbench";

const globalStyles = css`
${globalBaseStyles}
${globalLoginStyles}
${globalBackendUserControlStyles}
${globalWorkbenchStyles}
${globalAccountWorkbenchStyles}
`;

export default function AppGlobalStyles() {
  return <Global styles={globalStyles} />;
}
