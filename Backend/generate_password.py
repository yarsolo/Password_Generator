import sys
import secrets
import string

def generate_password(length):
    charset = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(charset) for _ in range(length))

if __name__ == "__main__":
    try:
        length = int(sys.argv[1]) if len(sys.argv) > 1 else 12
        if length < 8 or length > 20:
            raise ValueError("Length must be 8-20")
        print(generate_password(length))
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)