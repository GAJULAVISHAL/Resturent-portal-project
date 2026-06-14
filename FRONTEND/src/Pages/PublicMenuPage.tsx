import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import apiClient from "../apiClient";

type MenuCategory = {
  id?: number;
  name?: string;
  adminId?: number;
};

type PublicMenuItem = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  category?: MenuCategory | string | null;
};

export const PublicMenuPage = () => {
  const [data, setData] = useState<PublicMenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = routeId ?? searchParams.get("id") ?? "guest";

  const getCategoryName = (item: PublicMenuItem) =>
    typeof item.category === "string"
      ? item.category
      : item.category?.name ?? "Uncategorized";

  useEffect(() => {
    let isMounted = true;

    async function getData() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(
          `api/v1/menu/publicMenu?id=${sessionId}`,
        );

        if (!isMounted) return;

        const items = Array.isArray(response.data?.Availableitems)
          ? response.data.Availableitems
          : [];

        setData(items);
      } catch (fetchError) {
        if (!isMounted) return;

        setError("Unable to load the public menu right now.");
        setData([]);
        console.error(fetchError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    getData();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const categories = useMemo(() => {
    const categoryNames = data
      .map((item) => getCategoryName(item))
      .filter(Boolean);

    return ["all", ...new Set(categoryNames)];
  }, [data]);

  const visibleItems = useMemo(() => {
    if (activeCategory === "all") {
      return data;
    }

    return data.filter((item) => getCategoryName(item) === activeCategory);
  }, [data, activeCategory]);

  const groupedSections = useMemo(() => {
    const groupedItems = visibleItems.reduce<Record<string, PublicMenuItem[]>>(
      (groups, item) => {
        const categoryName = getCategoryName(item);

        if (!groups[categoryName]) {
          groups[categoryName] = [];
        }

        groups[categoryName].push(item);
        return groups;
      },
      {},
    );

    return Object.entries(groupedItems).map(([name, items]) => ({
      name,
      items,
    }));
  }, [visibleItems]);

  return (
    <div className="min-h-screen bg-[#f5f9ff] text-slate-900">
      <div className="mx-auto min-h-screen max-w-5xl px-3 py-3 sm:px-4 sm:py-4">
        <section className="overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-[0_16px_40px_rgba(59,130,246,0.08)] backdrop-blur-xl">
          <div className="border-b border-sky-100 px-4 py-4 sm:px-5 sm:py-5">
            <h1 className="text-xl font-semibold tracking-tight text-sky-950 sm:text-2xl">
              Menu
            </h1>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-5 w-28 animate-pulse rounded-full bg-sky-100" />
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 3 }).map((__, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="h-16 animate-pulse rounded-xl border border-sky-100 bg-sky-50"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                {error}
              </div>
            ) : groupedSections.length > 0 ? (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        activeCategory === category
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-sky-100 bg-sky-50 text-sky-800 hover:bg-sky-100"
                      }`}
                    >
                      {category === "all" ? "All" : category}
                    </button>
                  ))}
                </div>

                {groupedSections.map((section) => (
                  <section key={section.name} className="scroll-mt-6">
                    <div className="border-b border-sky-100 pb-2">
                      <h2 className="text-base font-semibold text-sky-950 sm:text-lg">
                        {section.name}
                      </h2>
                    </div>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {section.items.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-xl border border-sky-100 bg-white px-3 py-3 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-sky-100 bg-sky-50">
                              <img
                                src={
                                  item.imageUrl ||
                                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
                                }
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-semibold text-sky-950 sm:text-base">
                                {item.name}
                              </h3>
                              <div className="mt-1 flex items-center gap-2 text-xs text-sky-700">
                                <span className="rounded-full bg-sky-50 px-2 py-1 font-semibold">
                                  ₹{Number(item.price).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-6 text-center text-sm text-sky-800">
                No menu items are available right now.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
