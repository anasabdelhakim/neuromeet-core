export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse animate-page-entrance">
      {}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-black-soft-subtle p-6 rounded-soft border border-border">
        <div className="space-y-3 flex-1 w-full">
          <div className="h-4 w-32 bg-white-soft-muted rounded-medium" />
          <div className="h-8 w-64 bg-white-soft-muted rounded-medium mt-2" />
          <div className="h-4 w-96 max-w-full bg-white-soft-muted rounded-medium" />
          <div className="h-4 w-24 bg-white-soft-muted rounded-medium mt-4" />
        </div>
        <div className="h-10 w-32 bg-white-soft-muted rounded-medium mt-4 md:mt-0" />
      </div>

      {}
      <div className="w-full bg-black-soft-subtle border border-border rounded-soft p-5 flex flex-col gap-4">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="h-6 w-24 bg-white-soft-muted rounded-medium" />
            <div className="h-10 w-full sm:max-w-md bg-white-soft-muted rounded-soft" />
         </div>
         <div className="flex flex-col gap-4 mt-2">
           {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white-soft-muted rounded-full shrink-0" />
                    <div className="flex flex-col gap-2">
                       <div className="h-4 w-32 bg-white-soft-muted rounded-medium" />
                       <div className="h-3 w-48 bg-white-soft-muted rounded-medium" />
                    </div>
                 </div>
                 <div className="h-8 w-8 bg-white-soft-muted rounded-medium" />
              </div>
           ))}
         </div>
      </div>
    </div>
  );
}
