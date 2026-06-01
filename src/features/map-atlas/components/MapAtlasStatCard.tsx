interface MapAtlasStatCardProps {
  label: string;
  value: string;
}

export const MapAtlasStatCard = ({ label, value }: MapAtlasStatCardProps) => (
  <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-2.5">
    <p className="text-role-caption uppercase text-muted-foreground">{label}</p>
    <p className="text-role-subheading text-numeric-tabular mt-1 text-foreground">
      {value}
    </p>
  </div>
);
