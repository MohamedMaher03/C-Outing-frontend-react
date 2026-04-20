import { useI18n } from "@/components/i18n";

const NotFound = () => {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          {t("route.notFound")}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
