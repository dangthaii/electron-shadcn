import { SiElectron, SiReact, SiVite } from "@icons-pack/react-simple-icons";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { getAppVersion } from "@/actions/app";
import { runExport, runImport } from "@/actions/unload";
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
  const [busy, setBusy] = useState<null | "export" | "import">(null);
  const [output, setOutput] = useState<string>("");
  const { t } = useTranslation();

  useEffect(
    () => startGetAppVersion(() => getAppVersion().then(setAppVersion)),
    []
  );

  const handleExport = async () => {
    setBusy("export");
    setOutput("");
    try {
      const { path } = await runExport();
      setOutput(`Đã export xong → ${path}`);
    } catch (error) {
      setOutput(`Export lỗi: ${String(error)}`);
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async () => {
    setBusy("import");
    setOutput("");
    try {
      const { data, path, exists } = await runImport();
      if (!exists) {
        setOutput(`Chưa có data.json. Hãy bấm Export trước.\n${path}`);
        return;
      }
      console.log("Import data:", data);
      setOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput(`Import lỗi: ${String(error)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <NavigationMenu />
      <div className="flex h-full flex-col items-center justify-center">

        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <Button disabled={busy !== null} onClick={() => void handleExport()}>
              {busy === "export" ? "Đang export..." : "Export"}
            </Button>
            <Button
              disabled={busy !== null}
              onClick={() => void handleImport()}
              variant="secondary"
            >
              {busy === "import" ? "Đang import..." : "Import"}
            </Button>
          </div>
          {output && (
            <pre className="max-w-xl overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
              {output}
            </pre>
          )}
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
