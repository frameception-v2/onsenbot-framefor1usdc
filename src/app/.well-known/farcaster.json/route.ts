import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOiA4ODcyNDYsICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4N0Q0MDBGRDFGNTkyYkI0RkNkNmEzNjNCZkQyMDBBNDNEMTY3MDRlNyJ9",
      payload: "eyJkb21haW4iOiAib25zZW5ib3QtZnJhbWVmb3IxdXNkYy52ZXJjZWwuYXBwIn0",
      signature: "MHg3YmRiNzEwMDQ2MTM0YTI0NTMzYTRlNDhlNTY4ZWI4YjQxNTkyZDRlNjNmMmZjNDlmMmY3NGZhOGZkNmJjZmUxNDZiNzFhZmU0MWI2YjgyM2NiMGE4MzZmZTA5NjdkNzhiYzMzYmJjNjljZDI1M2UxNTMyMWJiZjdkNWRjYzk2YTFi"
    },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
