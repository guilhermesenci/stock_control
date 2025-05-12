def to_camel_case(snake_str):
    """
    Convert a snake_case string to camelCase
    """
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def camelize_dict_keys(data):
    """
    Recursively converts all dictionary keys from snake_case to camelCase
    """
    if isinstance(data, dict):
        return {
            to_camel_case(k): camelize_dict_keys(v)
            for k, v in data.items()
        }
    elif isinstance(data, list):
        return [camelize_dict_keys(item) for item in data]
    else:
        return data

def to_snake_case(camel_str):
    """
    Convert a camelCase string to snake_case
    """
    result = [camel_str[0].lower()]
    for char in camel_str[1:]:
        if char.isupper():
            result.append('_')
            result.append(char.lower())
        else:
            result.append(char)
    return ''.join(result)

def snakify_dict_keys(data):
    """
    Recursively converts all dictionary keys from camelCase to snake_case
    """
    if isinstance(data, dict):
        return {
            to_snake_case(k): snakify_dict_keys(v)
            for k, v in data.items()
        }
    elif isinstance(data, list):
        return [snakify_dict_keys(item) for item in data]
    else:
        return data 