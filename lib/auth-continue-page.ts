type ContinuePageOptions = {
  href: string;
  title: string;
  heading: string;
  copy: string;
  button: string;
  autoRedirect: boolean;
};

export function authContinuePage({
  href,
  title,
  heading,
  copy,
  button,
  autoRedirect,
}: ContinuePageOptions) {
  const safeHref = JSON.stringify(href);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${title}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 24px; background: #f3efe6; color: #16191f; font: 15px/1.5 "IBM Plex Sans", ui-sans-serif, sans-serif; }
    main { width: min(100%, 420px); padding: 36px; border: 1px solid #ddd6c8; border-radius: 14px; background: #fbf8f1; box-shadow: 0 1px 2px rgba(22, 25, 31, .04), 0 10px 28px rgba(22, 25, 31, .05); }
    h1 { margin: 0 0 12px; font-family: Newsreader, "Iowan Old Style", serif; font-size: 28px; font-weight: 500; line-height: 1.15; letter-spacing: -.03em; }
    p { margin: 0 0 24px; color: #5c6168; }
    a { width: 100%; height: 48px; display: flex; align-items: center; justify-content: center; border: 1px solid #cfc6b6; border-radius: 8px; background: #fbf8f1; color: #16191f; font-weight: 600; text-decoration: none; }
    a:hover { border-color: #16191f; }
  </style>
</head>
<body>
  <main>
    <h1>${heading}</h1>
    <p>${copy}</p>
    <a href=${safeHref}>${button}</a>
  </main>
  ${autoRedirect ? `<script>location.replace(${safeHref})</script>` : ""}
</body>
</html>`;
}

export function copySetCookies(from: Response, to: Response) {
  for (const cookie of from.headers.getSetCookie()) {
    to.headers.append("Set-Cookie", cookie);
  }
}
