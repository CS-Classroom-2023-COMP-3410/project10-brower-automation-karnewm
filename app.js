const puppeteer = require("puppeteer");
const credentials = require("./credentials.json");

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Repositories to star
  const repos = [
    "https://github.com/cheeriojs/cheerio",
    "https://github.com/axios/axios",
    "https://github.com/puppeteer/puppeteer"
  ];

  // GO TO GITHUB LOGIN PAGE
  await page.goto("https://github.com/login");

  // ENTER USERNAME
  await page.type("#login_field", credentials.username);

  // ENTER PASSWORD
  await page.type("#password", credentials.password);

  // CLICK SIGN IN
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation()
  ]);

  console.log("Logged into GitHub");

  // STAR EACH REPOSITORY
  for (const repo of repos) {

    await page.goto(repo);

    try {
      await page.waitForSelector('form[action*="/star"] button');

      await page.click('form[action*="/star"] button');

      console.log(`Starred ${repo}`);

      await page.waitForTimeout(2000);

    } catch (err) {
      console.log(`Already starred or failed: ${repo}`);
    }
  }

  // GO TO STARS PAGE
  await page.goto(`https://github.com/${credentials.username}?tab=stars`);

  // CREATE NEW LIST
  try {

    await page.waitForSelector('button[aria-label="Create list"]');

    await page.click('button[aria-label="Create list"]');

    await page.waitForSelector('input[name="name"]');

    await page.type('input[name="name"]', "Node Libraries");

    await page.click('button[type="submit"]');

    console.log("Created list: Node Libraries");

    await page.waitForTimeout(3000);

  } catch (err) {
    console.log("List may already exist");
  }

  // ADD REPOS TO LIST
  for (const repo of repos) {

    const repoName = repo.split("github.com/")[1];

    await page.goto(`https://github.com/${repoName}`);

    try {

      await page.waitForSelector('summary[aria-label="Add to list"]');

      await page.click('summary[aria-label="Add to list"]');

      await page.waitForSelector('label');

      const lists = await page.$$('label');

      for (const list of lists) {

        const text = await page.evaluate(el => el.textContent, list);

        if (text.includes("Node Libraries")) {
          await list.click();
        }

      }

      console.log(`Added ${repoName} to Node Libraries`);

      await page.waitForTimeout(2000);

    } catch (err) {
      console.log(`Could not add ${repoName}`);
    }

  }

  console.log("All tasks completed");

  await page.waitForTimeout(60000);

  await browser.close();

})();