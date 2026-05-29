"""
Ethan Core package.

Target architecture:
Frontend -> API Routes -> Ethan Core
  -> Context Engine
  -> Memory Engine
  -> Strategy Engine
  -> Runtime Engine
  -> Persistence Engine
  -> Prompt Engine
  -> Response Engine
  -> OpenAI Gateway

Satellites feed backend data only; they do not call OpenAI and do not decide.
"""
