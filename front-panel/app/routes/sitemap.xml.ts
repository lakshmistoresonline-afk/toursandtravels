import { ToursService } from "@workspace/shared/services/tours.service";
import { format } from "date-fns";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({}: LoaderFunctionArgs) {
	const baseUrl = process.env.VITE_MAIN_APP_URL;

	if (!baseUrl) {
		throw new Error("VITE_MAIN_APP_URL is not defined");
	}

	const urls: string[] = [];

	const tours_svc = new ToursService();
	const toursResp = await tours_svc.getHighLevelTours("");

	urls.push(`
            <url>
            <loc>${baseUrl}</loc>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
            </url>
        `);

	["contact-us", "about"].forEach((url, idx) => {
		urls.push(
			`
            <url>
            <loc>${baseUrl}/${url}</loc>
            <priority>${idx <= 1 ? "1.0" : "0.9"}</priority>
            </url>
            `,
		);
	});

	urls.push(
		`
            <url>
            <loc>${baseUrl}/tours</loc>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
            </url>
            `,
	);

	for (const tour of toursResp.tours) {
		let lastmod = "";
		if (tour.updatedAt) {
			try {
				const dateObj =
					typeof (tour.updatedAt as any).toDate === "function"
						? (tour.updatedAt as any).toDate()
						: new Date(tour.updatedAt as any);
				lastmod = `<lastmod>${format(dateObj, "yyyy-MM-dd")}</lastmod>`;
			} catch (e) {
				// Skip lastmod if invalid
			}
		}

		urls.push(`
        <url>
            <loc>${baseUrl}/tours/tour/${tour.id}</loc>
            ${lastmod}
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
        `);
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls.join("")}
    </urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
