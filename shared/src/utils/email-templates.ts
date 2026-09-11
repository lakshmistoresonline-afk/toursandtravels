import { GetTourDetails } from "../types/tours";

export const generateJourneyAnnouncementHtml = (tour: GetTourDetails, appUrl: string) => {
	const registrationUrl = `${appUrl}/tours/tour/${tour.id}`;

	const itineraryHtml = tour.itinerary
		.sort((a, b) => a.day_number - b.day_number)
		.map(
			(day) => `
        <div style="margin-bottom: 20px; border-left: 2px solid #d4af37; padding-left: 15px;">
            <div style="font-weight: bold; color: #d4af37; font-size: 14px; text-transform: uppercase; margin-bottom: 5px;">Day ${day.day_number}</div>
            <div style="font-weight: bold; font-size: 18px; color: #0a0e1a; margin-bottom: 5px;">${day.title}</div>
            <div style="color: #666; font-size: 14px; line-height: 1.6;">${day.description}</div>
        </div>
    `,
		)
		.join("");

	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tour.name} - Journey Announcement</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fdfcf0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0a0e1a;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eee;">
        <!-- Header -->
        <tr>
            <td align="center" style="padding: 40px 0; background-color: #0a0e1a;">
                <h1 style="margin: 0; color: #d4af37; font-size: 28px; letter-spacing: 4px; text-transform: uppercase;">AMBADY</h1>
                <div style="color: #fdfcf0; font-size: 12px; letter-spacing: 2px; margin-top: 5px; opacity: 0.8;">PILGRIMAGE EXPERIENCES</div>
                <div style="color: #d4af37; font-size: 10px; margin-top: 10px; font-style: italic;">Faith | Heritage | Inner Journeys</div>
            </td>
        </tr>

        <!-- Hero Image -->
        ${
			tour.cover_image
				? `
        <tr>
            <td>
                <img src="${tour.cover_image}" alt="${tour.name}" width="600" style="display: block; width: 100%; height: auto;">
            </td>
        </tr>
        `
				: ""
		}

        <!-- Journey Title -->
        <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: center;">
                <h2 style="margin: 0; font-size: 32px; color: #0a0e1a;">${tour.name}</h2>
                <div style="width: 60px; hieght: 2px; background-color: #d4af37; margin: 20px auto;"></div>
                <p style="font-size: 16px; color: #d4af37; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${tour.destination}</p>
            </td>
        </tr>

        <!-- Journey Details Table -->
        <tr>
            <td style="padding: 0 30px 30px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdfcf0; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td width="50%" style="padding: 10px 0;">
                            <div style="font-size: 10px; color: #999; text-transform: uppercase;">Date</div>
                            <div style="font-weight: bold; font-size: 14px;">${tour.start_date || "Flexible"}</div>
                        </td>
                        <td width="50%" style="padding: 10px 0;">
                            <div style="font-size: 10px; color: #999; text-transform: uppercase;">Duration</div>
                            <div style="font-weight: bold; font-size: 14px;">${tour.end_date ? "Multi-day" : "Custom"}</div>
                        </td>
                    </tr>
                    <tr>
                        <td width="50%" style="padding: 10px 0;">
                            <div style="font-size: 10px; color: #999; text-transform: uppercase;">Exchange</div>
                            <div style="font-weight: bold; font-size: 14px; color: #d4af37;">${tour.price > 0 ? `₹${tour.price.toLocaleString()}` : "Inquiry Only"}</div>
                        </td>
                        <td width="50%" style="padding: 10px 0;">
                            <div style="font-size: 10px; color: #999; text-transform: uppercase;">Availability</div>
                            <div style="font-weight: bold; font-size: 14px;">${tour.max_participants || "Limited Seats"}</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Overview -->
        <tr>
            <td style="padding: 0 30px 40px 30px; font-size: 16px; line-height: 1.8; color: #444;">
                <h3 style="color: #0a0e1a; margin-top: 0;">The Spiritual Calling</h3>
                ${tour.overview}
            </td>
        </tr>

        <!-- Itinerary -->
        ${
			itineraryHtml
				? `
        <tr>
            <td style="padding: 0 30px 40px 30px;">
                <h3 style="color: #0a0e1a; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px;">The Journey Roadmap</h3>
                ${itineraryHtml}
            </td>
        </tr>
        `
				: ""
		}

        <!-- CTA -->
        <tr>
            <td align="center" style="padding: 0 30px 60px 30px;">
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" bgcolor="#d4af37" style="border-radius: 50px;">
                            <a href="${registrationUrl}" style="display: inline-block; padding: 20px 40px; color: #0a0e1a; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Register for this Journey</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Instructions -->
        <tr>
            <td style="padding: 40px 30px; background-color: #f9f9f9; border-top: 1px solid #eee;">
                <h4 style="margin-top: 0; color: #0a0e1a; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">How to register</h4>
                <ol style="padding-left: 20px; font-size: 13px; color: #666; line-height: 1.6;">
                    <li>Click the <strong>Register for this Journey</strong> button above.</li>
                    <li>Sign in to your AMBADY account (or create one if you're new).</li>
                    <li>Review the journey details and selected pilgrimage path.</li>
                    <li>Complete the registration form and confirm your participation.</li>
                </ol>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td align="center" style="padding: 40px 30px; background-color: #0a0e1a; color: #ffffff;">
                <div style="font-size: 14px; font-weight: bold; color: #d4af37; letter-spacing: 2px;">AMBADY</div>
                <div style="font-size: 10px; margin-top: 5px; opacity: 0.6;">PILGRIMAGE EXPERIENCES</div>
                <p style="font-size: 12px; margin-top: 20px; line-height: 1.6; opacity: 0.5;">
                    You are receiving this email because you have registered with AMBADY and enabled journey announcements.
                </p>
                <div style="margin-top: 30px;">
                    <a href="${appUrl}/account/details" style="color: #d4af37; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Manage Preferences</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};
