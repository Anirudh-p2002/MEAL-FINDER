// Fetch and display meal categories
const fetchItems = async () => {
  const response = await fetch(
    "https://www.themealdb.com/api/json/v1/1/categories.php"
  );
  const data = await response.json();
  return data;
};

fetchItems()
  .then((data) => {
    displayItems(data);
    itemsOfList(data);
  })
  .catch((err) => console.log(err));

// Render category cards
async function displayItems(data) {
  const container = document.getElementById("items-container");
  container.innerHTML = "";
  const text = document.createElement("h2");
  text.className = "heading";
  text.innerText = "Categories";
  container.appendChild(text);

  data.categories.forEach((category) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${category.strCategoryThumb}" class="card-img-top" alt="${category.strCategory}">
      <h5 class="card-title">${category.strCategory}</h5>
    `;
    container.appendChild(card);
  });
}

// Create offcanvas menu and button
const nav = document.getElementById("navbar");
const databtn = document.createElement("div");
databtn.className = "buttonfn";
databtn.innerHTML = `
  <button class="btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#staticBackdrop" aria-controls="staticBackdrop">
    <i class="fa-solid fa-bars"></i>
  </button>
  <div class="offcanvas offcanvas-end" data-bs-backdrop="static" tabindex="-1" id="staticBackdrop" aria-labelledby="staticBackdropLabel" style="width:25%">
    <div class="offcanvas-header">
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <div id="list"><ul id="liItems" class="list-group"></ul></div>
    </div>
  </div>
`;
nav.appendChild(databtn);

// Populate category list in offcanvas
const itemsOfList = async (data) => {
  const ul = document.getElementById("liItems");
  if (!ul || !data || !data.categories) return;
  ul.innerHTML = "";
  data.categories.forEach((category) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = category.strCategory;
    ul.appendChild(li);
  });
};

// Fetch meals by category
const fetchMealsByCategory = async (categoryName) => {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`
  );
  const data = await response.json();
  return data;
};

// Render meals for selected category
const displayDataItems = async (data, mealName) => {
  const container = document.getElementById("mealsInfo");
  // console.log(main);

  // Clear container and add title
  container.innerHTML = "";
  // Fetch and insert category details (if available)
  try {
    const res = await fetch(
      "https://www.themealdb.com/api/json/v1/1/categories.php"
    );
    const cats = await res.json();
    const category = cats.categories?.find((c) => c.strCategory === mealName);
    if (category) {
      const details = document.createElement("div");
      details.className = "category-details";
      details.innerHTML = `
        <div class="card-body">
          <h1>${category.strCategory}</h1>
          <p class="card-text">${category.strCategoryDescription}</p>
        </div>
      `;
      container.appendChild(details);
    }
  } catch (err) {
    console.error("Error loading category details:", err);
  }

  // Add Meals heading
  const mealsHeading = document.createElement("h3");
  mealsHeading.className = "heading";
  mealsHeading.textContent = "Meals";
  container.appendChild(mealsHeading);
  data.meals.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card-1";
    card.innerHTML = `
      <img src="${item.strMealThumb}" class="card-img" alt="${item.strMeal}">
        <h5 class="card-title-1">${item.strMeal}</h5>
    `;
    container.appendChild(card);
  });
};

// Handle category click
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("list-group-item")) {
    const categoryName = event.target.textContent;
    const data = await fetchMealsByCategory(categoryName);
    displayDataItems(data, categoryName);
  }
  if (event.target.classList.contains("list-group-item")) {
    document.querySelector(".offcanvas .btn-close").click();
  }
});

document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("card-img-top")) {
    const mealName = event.target.alt;
    const data = await fetchMealsByCategory(mealName);
    displayDataItems(data, mealName);
  }
});

// Show full meal details (navbar with home icon + category name, image, category info, tags, instructions, ingredients)
document.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("card-img")) return;

  const mealName = event.target.alt;
  if (!mealName) return;

  const container = document.getElementById("mealsInfo");
  container.innerHTML = "";

  try {
    const mealRes = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        mealName
      )}`
    );
    const mealData = await mealRes.json();
    const meal = mealData.meals && mealData.meals[0];
    if (!meal) {
      container.textContent = "Meal details not found." && "Try Again later";
      return;
    }

    const topBar = document.createElement("div");
    topBar.className = "detail-topbar d-flex align-items-center";
    topBar.innerHTML = `
      <button type="button" class="btn btn-link detail-home" title="Home">
        <i class="fa-solid fa-house"></i>
      </button>
      <div class="detail-category-name ms-0">${meal.strMeal}</div>
    `;
    container.appendChild(topBar);

    let categoryThumbHtml = "";
    const tags = meal.strTags
      ? meal.strTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Build parallel arrays for ingredients and measures (only for non-empty ingredients)
    const ingredients = [];
    const measures = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push(ing.trim());
        measures.push(measure && measure.trim() ? measure.trim() : ""); // keep blank if no measure
      }
    }

    const detail = document.createElement("div");
    detail.className = "container";
    detail.innerHTML = `
      <div class="meal-main d-flex gap-4 flex-wrap">
        <div class="meal-img">
          <img src="${meal.strMealThumb}" alt="${
      meal.strMeal
    }" style="max-width:320px;width:100%;border-radius:8px;">
        </div>
        <div class='meal-info' style="flex:1;min-width:220px;">
        <h3 class= "meal-ct">${meal.strMeal}</h3>
        <h6 class="meal-title">Category : ${meal.strCategory || ""}</h6>
        <div class="meal-meta">
          ${categoryThumbHtml}
          ${
            tags.length
              ? `<div class="meal-tags m-2"><strong>Tags:  </strong> ${tags
                  .map((t) => `<span class="bot me-1">${t}</span>`)
                  .join(" ")}</div>`
              : ""
          }
          <div class="meal-source mb-2"><strong>Source:</strong> ${
            meal.strSource
              ? `<a href="${meal.strSource}" target="_blank" rel="noopener">${meal.strSource}</a>`
              : "N/A"
          }</div>
        </div>
        <div class="meal-ingredients">
      <h4>Ingredients</h4>
      <ol>${ingredients.map((i) => `<li>${i}</li>`).join("")}</ol>
      </div>
        </div>
      </div> 
      
      <div class="meal-measures" style="min-width:150px;">
      <h4>Measures</h4>
      <ul>${measures.map((m) => `<li>${m || "—"}</li>`).join("")}</ul>
      </div>
      </div>


      <div class="meal-instructions mt-3">
        <h4>Instructions</h4>
        <p>${meal.strInstructions || ""}</p>
      </div>
      `;
    container.appendChild(detail);

    const offcanvasClose = document.querySelector(".offcanvas .btn-close");
    if (offcanvasClose) offcanvasClose.click();
  } catch (err) {
    console.error("Error loading meal details:", err);
    const container = document.getElementById("mealsInfo");
    container.textContent = "An error occurred while loading meal details.";
  }
});

// Search button / Enter key behavior (robust target element handling)
const handleSearch = async () => {
  const input = document.getElementById("searchInput");
  const button = document.getElementById("searchButton");
  const query = input?.value.trim() || "";
  const container = document.getElementById("mealsInfo");
  container.innerHTML = "";

  if (!query) {
    container.textContent = "Please enter a search term.";
    return;
  }

  try {
    if (button) button.disabled = true;
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        query
      )}`
    );
    const result = await res.json();

    if (!result.meals) {
      container.textContent = `No meals found for "${query}".`;
      return;
    }

    const resultsWrapper = document.createElement("div");
    const mealsHeading = document.createElement("h3");
    mealsHeading.className = "heading";
    mealsHeading.textContent = "Meals";
    resultsWrapper.appendChild(mealsHeading);
    resultsWrapper.className = "search-results";
    result.meals.forEach((meal) => {
      const card = document.createElement("div");
      card.className = "card-1";

      const img = document.createElement("img");
      img.src = meal.strMealThumb || "";
      img.alt = meal.strMeal || "";
      img.className = "card-img"; // reuse existing detail click handler

      const title = document.createElement("div");
      title.className = "card-title-1";
      title.textContent = meal.strMeal;

      card.appendChild(img);
      card.appendChild(title);
      resultsWrapper.appendChild(card);
    });

    container.appendChild(resultsWrapper);

    // If only one result, open detail view
    if (result.meals.length === 1) {
      const firstImg = resultsWrapper.querySelector("img.card-img");
      if (firstImg) firstImg.click();
    }

    // Close offcanvas if open
    const offcanvasClose = document.querySelector(".offcanvas .btn-close");
    if (offcanvasClose) offcanvasClose.click();
  } catch (err) {
    console.error(err);
    container.textContent =
      "An error occurred while searching. Please try again.";
  } finally {
    const button = document.getElementById("searchButton");
    if (button) button.disabled = false;
  }
};

const attachSearchHandlers = () => {
  const input = document.getElementById("searchInput");
  const button = document.getElementById("searchButton");

  if (button) button.addEventListener("click", handleSearch);
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    });
  }
};

// If inputs aren't available yet, wait for DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachSearchHandlers);
} else {
  attachSearchHandlers();
}

// Handle home button click
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("detail-home")) {
    const container = document.getElementById("mealsInfo");
    container.innerHTML = ""; // Clear current meal details
    const itemsContainer = document.getElementById("items-container");
    itemsContainer.scrollIntoView({ behavior: "smooth" }); // Scroll back to categories
  }
});


