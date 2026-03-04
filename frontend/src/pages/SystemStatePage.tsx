import { Button, Card, Progress, Typography } from "antd";
import { CSSProperties } from "react";
import { AppLocale } from "../lib/i18n";
import {
  PrototypeActionRow,
  PrototypeCenterBody,
  PrototypeHeaderLayout,
  PrototypeInfoStack
} from "./prototypeCssInJs";

interface SystemStatePageProps {
  locale: AppLocale;
  currentPath: string;
  stateKind: "loading" | "empty" | "error" | "permission";
  onNavigate: (path: string) => void;
}

interface StateCopy {
  nav: string;
  hint: string;
  title: string;
  summary: string;
  routeInfo: string;
  action?: string;
  actionRetry?: string;
  actionBack?: string;
}

const copy = {
  en: {
    loading: {
      nav: "Loading State",
      hint: "Polling in progress",
      title: "Preparing workspace data",
      summary: "The system is collecting skills, categories, and operational signals.",
      routeInfo: "timeline / internal / ready / warm"
    },
    empty: {
      nav: "Empty State",
      hint: "No matching records",
      title: "No data matched this filter",
      summary: "Adjust the current filter set or reset to global scope.",
      action: "Reset Filters",
      routeInfo: "reset / clear / global"
    },
    error: {
      nav: "Error State",
      hint: "Recoverable failure",
      title: "Request failed and needs retry",
      summary: "The backend request failed. Retry the operation or return to marketplace.",
      actionRetry: "Retry",
      actionBack: "Open Marketplace",
      routeInfo: "error / retry / route"
    },
    permission: {
      nav: "Permission State",
      hint: "Authorization required",
      title: "Permission denied for this operation",
      summary: "Sign in with a role that grants access to this workflow.",
      action: "Request Access",
      routeInfo: "role / scope / policy"
    }
  },
  zh: {
    loading: {
      nav: "\u52a0\u8f7d\u72b6\u6001",
      hint: "\u6b63\u5728\u8f6e\u8be2",
      title: "\u6b63\u5728\u51c6\u5907\u5de5\u4f5c\u53f0\u6570\u636e",
      summary: "\u7cfb\u7edf\u6b63\u5728\u63c7\u53d6\u6280\u80fd\u3001\u5206\u7c7b\u548c\u8fd0\u8425\u4fe1\u53f7\u3002",
      routeInfo: "\u65f6\u95f4\u7ebf / \u5185\u90e8 / \u5c31\u7eea / \u9884\u70ed"
    },
    empty: {
      nav: "\u7a7a\u72b6\u6001",
      hint: "\u65e0\u5339\u914d\u8bb0\u5f55",
      title: "\u5f53\u524d\u8fc7\u6ee4\u6761\u4ef6\u4e0b\u65e0\u6570\u636e",
      summary: "\u8bf7\u8c03\u6574\u8fc7\u6ee4\u6761\u4ef6\u6216\u91cd\u7f6e\u4e3a\u5168\u5c40\u8303\u56f4\u3002",
      action: "\u91cd\u7f6e\u8fc7\u6ee4",
      routeInfo: "\u91cd\u7f6e / \u6e05\u7406 / \u5168\u5c40"
    },
    error: {
      nav: "\u9519\u8bef\u72b6\u6001",
      hint: "\u53ef\u6062\u590d\u6545\u969c",
      title: "\u8bf7\u6c42\u5931\u8d25\uff0c\u9700\u8981\u91cd\u8bd5",
      summary: "\u540e\u7aef\u8bf7\u6c42\u5931\u8d25\uff0c\u53ef\u91cd\u8bd5\u64cd\u4f5c\u6216\u8fd4\u56de\u5e02\u573a\u3002",
      actionRetry: "\u91cd\u8bd5",
      actionBack: "\u6253\u5f00\u5e02\u573a",
      routeInfo: "\u9519\u8bef / \u91cd\u8bd5 / \u8def\u7531"
    },
    permission: {
      nav: "\u6743\u9650\u72b6\u6001",
      hint: "\u9700\u8981\u6388\u6743",
      title: "\u5f53\u524d\u64cd\u4f5c\u65e0\u8bbf\u95ee\u6743\u9650",
      summary: "\u8bf7\u4f7f\u7528\u6709\u8be5\u6d41\u7a0b\u6743\u9650\u7684\u8d26\u53f7\u767b\u5f55\u3002",
      action: "\u7533\u8bf7\u8bbf\u95ee",
      routeInfo: "\u89d2\u8272 / \u8303\u56f4 / \u7b56\u7565"
    }
  }
};

function resolvePublicBase(pathname: string): string {
  if (pathname.startsWith("/mobile/light")) {
    return "/mobile/light";
  }
  if (pathname.startsWith("/mobile")) {
    return "/mobile";
  }
  if (pathname.startsWith("/light")) {
    return "/light";
  }
  return "";
}

function toPublicRoute(base: string, route: string): string {
  return base ? `${base}${route}` : route;
}

function shellStyle(isLight: boolean): CSSProperties {
  return {
    minHeight: "calc(100vh - 84px)",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: isLight
      ? "#c8d2e0"
      : "radial-gradient(1200px 400px at 50% -5%, #082755 0%, #01142d 50%, #000a1f 100%)"
  };
}

export default function SystemStatePage({ locale, currentPath, stateKind, onNavigate }: SystemStatePageProps) {
  const text = copy[locale];
  const publicBase = resolvePublicBase(currentPath);
  const isLight = currentPath.startsWith("/light") || currentPath.startsWith("/mobile/light");

  const headerTitleColor = isLight ? "#14263d" : "#eff8ff";
  const headerHintColor = isLight ? "#2d5079" : "#7cc7ff";
  const headerLinkColor = isLight ? "#2e5de0" : "#1ec8ff";
  const cardBackground = isLight ? "#eef3f9" : "#1b3f6f";
  const cardBorderColor = isLight ? "#cfdae7" : "#294f82";
  const titleColor = isLight ? "#13283f" : "#f4fbff";
  const summaryColor = isLight ? "#3e5975" : "#c8dcf9";

  let content: StateCopy;
  if (stateKind === "loading") {
    content = text.loading;
  } else if (stateKind === "empty") {
    content = text.empty;
  } else if (stateKind === "error") {
    content = text.error;
  } else {
    content = text.permission;
  }

  const goHome = () => onNavigate(toPublicRoute(publicBase, "/"));

  return (
    <section style={shellStyle(isLight)}>
      <PrototypeHeaderLayout as="header">
        <PrototypeInfoStack>
          <Typography.Text
            strong
            style={{
              color: headerTitleColor,
              fontSize: "1.15rem",
              fontFamily: "\"Syne\", sans-serif",
              lineHeight: 1.2
            }}
          >
            {content.nav}
          </Typography.Text>
          <Typography.Text style={{ color: headerHintColor, fontSize: "0.74rem", letterSpacing: "0.03em" }}>
            {content.hint}
          </Typography.Text>
        </PrototypeInfoStack>
        <Button
          type="link"
          onClick={goHome}
          style={{ color: headerLinkColor, padding: 0, fontSize: "0.72rem", letterSpacing: "0.03em" }}
        >
          {content.routeInfo}
        </Button>
      </PrototypeHeaderLayout>

      <PrototypeCenterBody>
        <Card
          variant="borderless"
          style={{
            width: "min(860px, 100%)",
            minHeight: 208,
            borderRadius: 14,
            border: `1px solid ${cardBorderColor}`,
            background: cardBackground
          }}
          styles={{
            body: {
              padding: "22px 26px",
              minHeight: 208,
              display: "grid",
              alignContent: "center",
              justifyItems: "center",
              gap: 10,
              textAlign: "center"
            }
          }}
        >
          <Typography.Title
            level={2}
            style={{
              margin: 0,
              color: titleColor,
              fontFamily: "\"Syne\", sans-serif",
              fontSize: "clamp(1.16rem, 2.2vw, 1.82rem)",
              lineHeight: 1.2
            }}
          >
            {content.title}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, color: summaryColor, fontSize: "0.8rem", lineHeight: 1.5 }}>
            {content.summary}
          </Typography.Paragraph>

          {stateKind === "loading" ? (
            <Progress percent={66} showInfo={false} status="active" style={{ width: "min(420px, 100%)" }} />
          ) : null}

          {stateKind === "empty" && content.action ? (
            <Button type="primary" onClick={goHome} style={{ minWidth: 148, borderRadius: 8 }}>
              {content.action}
            </Button>
          ) : null}

          {stateKind === "error" ? (
            <PrototypeActionRow>
              <Button type="primary" onClick={() => window.location.reload()} style={{ minWidth: 148, borderRadius: 8 }}>
                {content.actionRetry}
              </Button>
              <Button onClick={goHome} style={{ minWidth: 148, borderRadius: 8 }}>
                {content.actionBack}
              </Button>
            </PrototypeActionRow>
          ) : null}

          {stateKind === "permission" && content.action ? (
            <Button
              type="primary"
              onClick={() => onNavigate(toPublicRoute(publicBase, "/login"))}
              style={{ minWidth: 148, borderRadius: 8 }}
            >
              {content.action}
            </Button>
          ) : null}
        </Card>
      </PrototypeCenterBody>
    </section>
  );
}
