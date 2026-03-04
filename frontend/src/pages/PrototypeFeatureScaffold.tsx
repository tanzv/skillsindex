import { Alert, Card, Spin, Typography } from "antd";
import { ReactNode } from "react";
import { PrototypePagePalette } from "./prototypePageTheme";
import { PrototypeHeaderLayout, PrototypeLoadingCenter, PrototypePageGrid } from "./prototypeCssInJs";

interface PrototypeFeatureScaffoldProps {
  palette: PrototypePagePalette;
  title: string;
  subtitle: string;
  actions: ReactNode;
  loading: boolean;
  loadingText: string;
  error: string;
  children: ReactNode;
}

export default function PrototypeFeatureScaffold({
  palette,
  title,
  subtitle,
  actions,
  loading,
  loadingText,
  error,
  children
}: PrototypeFeatureScaffoldProps) {
  return (
    <PrototypePageGrid>
      <Card
        variant="borderless"
        style={{ borderRadius: 16, border: `1px solid ${palette.headerBorder}`, background: palette.headerBackground }}
        styles={{ body: { padding: "14px 16px" } }}
      >
        <PrototypeHeaderLayout>
          <div>
            <Typography.Title
              level={2}
              style={{
                margin: 0,
                color: palette.headerTitle,
                fontFamily: "\"Syne\", sans-serif",
                fontSize: "clamp(1.1rem, 2.3vw, 1.5rem)",
                lineHeight: 1.2
              }}
            >
              {title}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: "6px 0 0", color: palette.headerSubtitle, fontSize: "0.8rem" }}>
              {subtitle}
            </Typography.Paragraph>
          </div>
          {actions}
        </PrototypeHeaderLayout>
      </Card>

      {loading ? (
        <PrototypeLoadingCenter>
          <Spin description={loadingText} />
        </PrototypeLoadingCenter>
      ) : null}
      {!loading && error ? <Alert type="error" showIcon message={error} /> : null}
      {!loading ? children : null}
    </PrototypePageGrid>
  );
}
