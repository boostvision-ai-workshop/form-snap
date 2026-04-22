"""Email template rendering for form submission notifications."""


def render_notification(
    *,
    form_name: str,
    form_id: str,
    submission_data: dict,
    dashboard_base_url: str,
) -> tuple[str, str, str]:
    """Render a submission notification email.

    Returns a tuple of (subject, text_body, html_body).
    """
    subject = f"New submission: {form_name}"

    # Build field/value rows
    field_rows_text = "\n".join(
        f"  {key}: {value}" for key, value in submission_data.items()
    )
    field_rows_html = "\n".join(
        f"<tr><td style='padding:4px 8px;font-weight:bold;'>{_h(key)}</td>"
        f"<td style='padding:4px 8px;'>{_h(str(value))}</td></tr>"
        for key, value in submission_data.items()
    )

    inbox_url = f"{dashboard_base_url.rstrip('/')}/dashboard/forms/{form_id}"

    text_body = (
        f"You have a new submission for \"{form_name}\".\n\n"
        f"Fields:\n{field_rows_text or '  (no fields)'}\n\n"
        f"View in FormSnap: {inbox_url}\n"
    )

    html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:16px;">
  <h2 style="margin-bottom:8px;">New submission: {_h(form_name)}</h2>
  <table style="border-collapse:collapse;width:100%;">
    <tbody>
{field_rows_html or '<tr><td style="color:#888;">(no fields)</td></tr>'}
    </tbody>
  </table>
  <p style="margin-top:24px;">
    <a href="{_h(inbox_url)}">View in FormSnap</a>
  </p>
</body>
</html>"""

    return subject, text_body, html_body


def _h(value: str) -> str:
    """Minimal HTML escaping for email content."""
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
