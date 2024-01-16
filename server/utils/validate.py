from validate_email_address import validate_email

def validate_user_data(email, password, first_name, last_name):
    if not email or not password or not first_name or not last_name:
        return False

    if not validate_email(email):
        return False

    return True

def validate_question_id(question_id):
    try:
        question_id = int(question_id)

        if question_id <= 0:
            return False

        return True

    except ValueError:
        return False
