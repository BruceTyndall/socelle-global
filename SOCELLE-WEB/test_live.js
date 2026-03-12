import fetch from 'node-fetch'

async function checkLive() {
  const url = 'https://socelle.pages.dev/debug-feeds'
  console.log(`Checking ${url}...`)
  
  try {
    const res = await fetch(url)
    const text = await res.text()
    
    console.log("Status:", res.status)
    if (text.includes("You're offline")) {
      console.log("Result: Offline screen detected")
    } else if (text.includes("Debug Feeds")) {
      console.log("Result: Debug Feeds rendered")
      console.log(text.substring(0, 500))
    } else {
      console.log("Result: Something else")
    }
  } catch (e) {
    console.error("Error fetching:", e.message)
  }
}

checkLive()
