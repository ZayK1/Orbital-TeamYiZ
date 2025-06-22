import httpx
from typing import Dict, Any

class AIService:
    
    def __init__(self, api_key: str, model: str = "deepseek/deepseek-r1-0528:free"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://openrouter.ai/api/v1"
        
    async def generate_skill_curriculum(
        self,
        skill_name: str,
        difficulty: str,
        duration_days: int
    ) -> Dict[str, Any]:
        """
        Generates a structured learning plan curriculum using OpenRouter.
        
        This method is responsible for:
        1.  Building a precise, role-based prompt.
        2.  Requesting a JSON object from the AI to minimize parsing errors.
        3.  Validating the response structure.
        """
        prompt = self._build_curriculum_prompt(skill_name, difficulty, duration_days)
        
        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.model,
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {"role": "system", "content": "You are a world-class instructional designer..."},
                            {"role": "user", "content": prompt}
                        ]
                    }
                )
                response.raise_for_status()
                
                return response.json()["choices"][0]["message"]["content"]
                
            except httpx.HTTPStatusError as e:
                raise AIGenerationError(f"AI service returned an error: {e.response.status_code}")
            except Exception as e:
                raise AIGenerationError(f"An unexpected error occurred: {str(e)}")

    def _build_curriculum_prompt(self, skill_name, difficulty, duration_days) -> str:
        return f"""
        Generate a structured {duration_days}-day learning curriculum for the skill "{skill_name}"
        at a "{difficulty}" level.
        
        The output MUST be a single JSON object with the following structure:
        {{
          "total_days": {duration_days},
          "days": [
            {{
              "day_number": 1,
              "title": "Title for Day 1",
              "tasks": ["Task 1", "Task 2"],
              "resources": ["Resource URL or book name"],
              "estimated_time": 60
            }}
          ]
        }}
        """

class AIGenerationError(Exception):
    pass 