export function searchIcons(collection, search, category = "all") {
  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return collection.filter((icon) => {
    const terms = [icon.name, icon.title, icon.category, ...icon.tags, ...icon.aliases]
      .join(" ")
      .toLowerCase();
    return (
      (category === "all" || icon.category === category) &&
      words.every((word) => terms.includes(word))
    );
  });
}
