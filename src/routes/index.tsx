import { SiElectron, SiReact, SiVite } from "@icons-pack/react-simple-icons";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { getAppVersion } from "@/actions/app";
import { runExampleAction } from "@/actions/example";
import ExternalLink from "@/components/external-link";
import LangToggle from "@/components/lang-toggle";
import NavigationMenu from "@/components/navigation-menu";
import ToggleTheme from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";

/*
 * Update this page to modify your home page.
 * You can delete this file component to start from a blank page.
 */

function HomePage() {
  const iconSize = 48;

  const [appVersion, setAppVersion] = useState("0.0.0");
  const [, startGetAppVersion] = useTransition();
  const [exampleMessage, setExampleMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { t } = useTranslation();

  useEffect(
    () => startGetAppVersion(() => getAppVersion().then(setAppVersion)),
    []
  );

  const handleRunAction = async () => {
    setIsRunning(true);
    try {
      const message = await runExampleAction();
      setExampleMessage(message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <NavigationMenu />
      <div className="flex h-full flex-col items-center justify-center">

        <div className="mt-6 flex flex-col items-center gap-2">
          <Button
            disabled={isRunning}
            onClick={() => void handleRunAction()}
          >
            {isRunning ? "Đang chạy..." : "Chạy thử"}
          </Button>
          {exampleMessage && (
            <p className="text-muted-foreground text-sm">{exampleMessage}</p>
          )}
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
