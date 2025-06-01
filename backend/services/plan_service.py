# backend/services/plan_service.py
import requests
import json
import os

def generate_30_day_plan(skill: str):
    
    prompt = f'''Create a 30-day learning plan for: "{skill}"

Your response must be a valid JSON array containing exactly 30 objects, one for each day.
Each object must follow this exact format:
{{
    "day": (number from 1-30),
    "tasks": ["task 1 description (natural and concise)", "task 2 description (natural and concise)", ...],
    "resources": ["URL or description of free online resource/app 1", "URL or description of free online resource/app 2", ...]
}}

Important:
1. Output ONLY the JSON array - no explanations or markdown.
2. Each day's tasks must be clear, crucial for progressive learning, and described in natural, concise language.
3. Tasks should progress from basics to advanced concepts.
4. Include 1-2 FREE online resources (websites or apps specific to "{skill}" if available, otherwise general learning platforms, YouTube videos, free courses, etc.) for each day.
5. The plan must be easy to follow, engaging, fun, and designed to avoid burnout.
6. Use proper JSON format with double quotes.
7. The key must be "tasks" (plural), not "task" (singular).
8. The plan should be structured to be enjoyable and sustainable.

Example of expected format:
[
    {{
        "day": 1,
        "tasks": ["Understand the basic fretboard layout and string names.", "Practice holding the guitar correctly and basic strumming with a pick."],
        "resources": ["JustinGuitar.com - Beginner's Course Module 1", "Fender Play app (offers some free lessons)"]
    }},
    {{
        "day": 2,
        "tasks": ["Learn your first two basic chords (e.g., E minor and C major).", "Practice switching between these two chords smoothly."],
        "resources": ["Andy Guitar - 10 Day Beginner Course - Day 1", "Ultimate Guitar: Chords & Tabs (app with chord diagrams)"]
    }}
]'''

    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable is not set")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://github.com/Orbital-TeamYiZ",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    payload = {
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": [
            {
                "role": "system", 
                "content": "You are a JSON API that only outputs valid JSON arrays. Never include explanations or markdown formatting. Always use double quotes for JSON strings. Always use 'tasks' (plural) as the key, not 'task'."
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 1000
    }

    try:
        print("\n>>> DEBUG: Processing request for skill:", skill)
        print("\n>>> DEBUG: Sending request with headers:")
        print(f"Authorization: Bearer {api_key[:8]}...{api_key[-4:]}")
        print("Other headers:", {k: v for k, v in headers.items() if k != 'Authorization'})
        print("\n>>> DEBUG: Payload:")
        print(json.dumps(payload, indent=2))

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=85
        )

        print("\n>>> DEBUG: Response status code:", response.status_code)
        print(">>> DEBUG: Response headers:", dict(response.headers))
        print("\n>>> DEBUG: Raw response text:")
        print(response.text)

        if response.status_code != 200:
            error_msg = f"API request failed with status {response.status_code}"
            try:
                error_json = response.json()
                error_msg += f": {json.dumps(error_json, indent=2)}"
            except:
                error_msg += f": {response.text}"
            raise ValueError(error_msg)

        try:
            resp_json = response.json()
            print("\n>>> DEBUG: Parsed response JSON:")
            print(json.dumps(resp_json, indent=2))
            
            if 'choices' not in resp_json or not resp_json['choices']:
                raise ValueError("No choices in API response")
                
            content = resp_json['choices'][0]['message']['content']
            
            print("\n>>> DEBUG: Raw content from API:")
            print(content)
            
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
            elif content.startswith("```"):
                content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
            
            content = content.strip()

            json_start_index = content.find('[')
            json_end_index = content.rfind(']')

            if json_start_index != -1 and json_end_index > json_start_index:
             
                content = content[json_start_index : json_end_index + 1]
                content = content.strip() 
            else:
                
                raise ValueError("Valid JSON array structure (starting with '[' and ending with ']') not found in API response content.")

            print("\n>>> DEBUG: Final cleaned content for JSON parsing:") 
            print(content)

            if not content:
                raise ValueError("Received empty content from API")

            try:
                plan = json.loads(content)
                
                if not isinstance(plan, list):
                    raise ValueError("Response must be a JSON array")
                
                if len(plan) != 30:
                    raise ValueError(f"Plan must contain exactly 30 days (got {len(plan)} days)")
                
                for item in plan:
                    if not isinstance(item, dict):
                        raise ValueError("Each item must be a dictionary")
                    if 'day' not in item:
                        raise ValueError("Each item must have a 'day' key")
                    if 'task' in item and 'tasks' not in item:
                        item['tasks'] = item.pop('task')
                    if 'tasks' not in item:
                        raise ValueError("Each item must have a 'tasks' key")
                    if not isinstance(item['tasks'], list):
                        raise ValueError("'tasks' must be an array")
                    if not (2 <= len(item['tasks']) <= 4):
                        raise ValueError(f"Day {item['day']} must have 2-4 tasks (has {len(item['tasks'])})")
                    if 'resource' in item and 'resources' not in item:
                        item['resources'] = item.pop('resource')
                    if 'resources' not in item:
                        raise ValueError("Each item must have a 'resources' key")
                    if not isinstance(item['resources'], list):
                        raise ValueError("'resources' must be an array")
                    if not (1 <= len(item['resources']) <= 2):
                        raise ValueError(f"Day {item['day']} must have 1-2 resources (has {len(item['resources'])})")
                
                return plan
                
            except json.JSONDecodeError as e:
                print("\n>>> DEBUG: JSON Parsing Error")
                print(f"Error: {str(e)}")
                print(f"Position: {e.pos}")
                print(f"Line: {e.lineno}, Column: {e.colno}")
                if content:
                    print("Content at error position:", content[max(0, e.pos-20):min(len(content), e.pos+20)])
                else:
                    print("Content is empty")
                raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
                
        except (KeyError, IndexError) as e:
            print(f"\n>>> DEBUG: Unexpected API response structure: {response.text}")
            raise ValueError(f"Unexpected API response structure: {str(e)}")
            
    except requests.exceptions.RequestException as e:
        print(f"\n>>> DEBUG: Request error: {str(e)}")
        raise ValueError(f"API request failed: {str(e)}")
    except Exception as e:
        print(f"\n>>> DEBUG: Error in generate_30_day_plan: {str(e)}")
        raise ValueError(f"Failed to generate plan: {str(e)}")