"""Mock authentication provider for local development.

Accepts tokens of the form: mock:<uid>:<email>:<verified>

  - uid: arbitrary string (no colons)
  - email: user email (no colons)
  - verified: "true" | "false" (case-insensitive)

Example: mock:user1:dev@example.com:false

Returns a claims dict compatible with the Firebase claims dict used elsewhere.
"""


def verify_mock_token(token: str) -> dict:
    """Parse a mock: token and return decoded claims.

    Raises ValueError for malformed tokens (caller maps this to 401).
    """
    if not token.startswith("mock:"):
        raise ValueError("Not a mock token")

    parts = token.split(":")
    # Expected: ["mock", uid, email, verified]
    if len(parts) != 4:
        raise ValueError(
            "Mock token must have the form mock:<uid>:<email>:<verified>"
        )

    _, uid, email, verified_str = parts

    if not uid:
        raise ValueError("Mock token uid must not be empty")
    if not email or "@" not in email:
        raise ValueError("Mock token email must be a valid email address")
    if verified_str.lower() not in ("true", "false"):
        raise ValueError("Mock token verified flag must be 'true' or 'false'")

    return {
        "uid": uid,
        "email": email,
        "email_verified": verified_str.lower() == "true",
        "name": None,
        "picture": None,
    }
