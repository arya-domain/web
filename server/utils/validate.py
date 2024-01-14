from validate_email_address import validate_email

def validate_user_data(email, password, first_name, last_name):
    if not email or not password or not first_name or not last_name:
        return False

    if not validate_email(email):
        return False

    return True
