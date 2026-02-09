import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiKeys } from "@/hooks/useApiKeys";
import { useDemoMode } from "@/hooks/useDemoMode";
import { testApiConnection } from "@/lib/apiClient";
import {
  Globe,
  Key,
  TestTube,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Palette,
  Monitor,
} from "lucide-react";

export function Settings() {
  const { t, i18n } = useTranslation();
  const { apiKeys, setApiKey } = useApiKeys();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<Record<string, { success: boolean; message: string } | null>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async (apiType: "deepfake" | "finance" | "ocr" | "gemini") => {
    setTesting((prev) => ({ ...prev, [apiType]: true }));
    setTestStatus((prev) => ({ ...prev, [apiType]: null }));

    const result = await testApiConnection(apiType, apiKeys[apiType]);
    
    setTestStatus((prev) => ({ ...prev, [apiType]: result }));
    setTesting((prev) => ({ ...prev, [apiType]: false }));
  };

  const apiConfigs = [
    { key: "deepfake" as const, label: t("settings.apiKeys.deepfake") },
    { key: "finance" as const, label: t("settings.apiKeys.finance") },
    { key: "ocr" as const, label: t("settings.apiKeys.ocr") },
    { key: "gemini" as const, label: "Google Gemini AI" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground">
          Configurez vos préférences et clés API
        </p>
      </div>

      <Tabs defaultValue="language" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="language">
            <Globe className="mr-2 h-4 w-4" />
            Langue
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="demo">
            <TestTube className="mr-2 h-4 w-4" />
            Demo
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Apparence
          </TabsTrigger>
        </TabsList>

        {/* Language */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.language.title")}</CardTitle>
              <CardDescription>
                Choisissez votre langue préférée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      {i18n.language === "fr" ? "Français" : "English"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Langue actuelle
                    </p>
                  </div>
                </div>
                <Button onClick={toggleLanguage} variant="outline">
                  {i18n.language === "fr" ? "Switch to English" : "Passer en Français"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.apiKeys.title")}</CardTitle>
              <CardDescription>
                Configurez vos clés API pour les services externes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {apiConfigs.map(({ key, label }) => (
                <div key={key} className="space-y-3 p-4 border rounded-lg">
                  <Label htmlFor={`api-key-${key}`}>{label}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`api-key-${key}`}
                        type={showKeys[key] ? "text" : "password"}
                        value={apiKeys[key]}
                        onChange={(e) => setApiKey(key, e.target.value)}
                        placeholder={t("settings.apiKeys.placeholder")}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => toggleShowKey(key)}
                      >
                        {showKeys[key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection(key)}
                      disabled={testing[key] || !apiKeys[key]}
                    >
                      {testing[key] ? (
                        <>
                          <Monitor className="mr-2 h-4 w-4 animate-spin" />
                          {t("settings.apiKeys.testing")}
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          {t("settings.apiKeys.test")}
                        </>
                      )}
                    </Button>
                  </div>
                  {testStatus[key] && (
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        testStatus[key]?.success ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {testStatus[key]?.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {testStatus[key]?.message}
                    </div>
                  )}
                  {apiKeys[key]?.startsWith("AIza") && key !== "gemini" && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <XCircle className="h-4 w-4" />
                        Attention : Ceci ressemble à une clé Google API. Veuillez l'utiliser dans le champ "Google Gemini AI" ci-dessous.
                    </div>
                  )}
                  {!apiKeys[key] && (
                    <p className="text-sm text-muted-foreground">
                      {/* TODO: Ajoutez votre clé API ici */}
                      <code className="bg-muted px-1 rounded">// TODO: Insert key here</code>
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Mode */}
        <TabsContent value="demo">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.demo.title")}</CardTitle>
              <CardDescription>
                Activez le mode demo pour tester l'application sans API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t("settings.demo.enabled")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.demo.description")}
                  </p>
                </div>
                <Switch checked={isDemoMode} onCheckedChange={toggleDemoMode} />
              </div>
              {isDemoMode && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <TestTube className="h-5 w-5" />
                    <span className="font-medium">Mode Demo actif</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    Les résultats sont générés aléatoirement à des fins de démonstration.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.appearance.title")}</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{t("settings.appearance.compact")}</p>
                    <p className="text-sm text-muted-foreground">
                      Réduire l'espacement entre les éléments
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
