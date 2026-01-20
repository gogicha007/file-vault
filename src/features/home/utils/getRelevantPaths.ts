import { PathItem } from "@/api/find-file";

export function getRelevantPaths(paths: PathItem[], keywords: string[]): PathItem[] {
    
    const loweredKeywords = keywords
        .map((k) => k.toLowerCase().trim())
        .filter((k) => k.length > 0)

    const scored = paths.map((p) => {
        const text = `${p.path} ${p.description ?? ''}`.toLowerCase()
        let score = 0
        for (const kw of loweredKeywords) {
            if (text.includes(kw)) score += 1
        }
        return { path: p, score }
    })

    scored.sort((a, b) => b.score - a.score)

    const filtered = scored.filter((s) => s.score > 0).map((s) => s.path)

    return filtered.length > 0 ? filtered : paths
}