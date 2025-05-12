import json
from .utils import camelize_dict_keys, snakify_dict_keys


class CamelSnakeCaseMiddleware:
    """
    Middleware that transforms request data from camelCase to snake_case
    and response data from snake_case to camelCase.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process request body from camelCase to snake_case
        if request.body and hasattr(request, 'content_type') and 'application/json' in request.content_type:
            try:
                # Parse the request body
                request_data = json.loads(request.body)
                
                # Convert camelCase keys to snake_case
                snake_data = snakify_dict_keys(request_data)
                
                # Replace the request body with the snake_case version
                request._body = json.dumps(snake_data).encode('utf-8')
            except Exception as e:
                # Log the error but don't break the request
                print(f"Error in CamelSnakeCaseMiddleware (request): {e}")
                pass
        
        # Get the response
        response = self.get_response(request)
        
        # Process response body from snake_case to camelCase
        if hasattr(response, 'content') and response.get('Content-Type', '') == 'application/json':
            try:
                # Parse the response content
                content = json.loads(response.content.decode('utf-8'))
                
                # Convert snake_case keys to camelCase
                camel_content = camelize_dict_keys(content)
                
                # Replace the response content with the camelCase version
                response.content = json.dumps(camel_content).encode('utf-8')
            except Exception as e:
                # Log the error but don't break the response
                print(f"Error in CamelSnakeCaseMiddleware (response): {e}")
                pass
        
        return response 