from agents import Agent, Runner
from dotenv import load_dotenv
load_dotenv()

def lol():
  agent = Agent(
    name="TestAgent",
    instructions="This is a test agent for demonstration purposes.",
    model="gpt-4",
  )

  runner = Runner.run_sync(agent, " hello")

  return runner.final_output

