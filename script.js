
/**
 * Path to the JSON data file.
 */
const DATA_RELATIVE_PATH = 'data/data.json';

/**
 * Global data holder. After initialization this will contain the parsed JSON
 * loaded from `data_relative_path` and can be accessed anywhere as
 * `globalThis.data` (or `window.data` in browsers).
 */
globalThis.data = null;

/**
 * Fetches JSON data from the specified relative path.
 * @returns {Promise<Object>} A promise that resolves to the parsed JSON data.
 */
async function fetchData() {
    const response = await fetch(DATA_RELATIVE_PATH);
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return await response.json();
}

/**
 * Creaates image paths based on Prefectures.
 * @param {Array} prefectures - Array of Prefectures.
 * @returns {Array} Array of image paths.
 */
function createImagePaths(prefectures) {
    return prefectures.map((prefecture, index) => {
        return [
            `figs/pie_${String(index).padStart(2, '0')}_${prefecture}.png`,
            `figs/pie_label_${String(index).padStart(2, '0')}_${prefecture}.png`
        ];
    });
}

/**
 * Gets the indices of the two prefectures most similar to the specified prefecture.
 * @param {Array} index - Index of the prefecture to compare.
 * @param {Array} matrix - Similarity matrix.
 * @returns {Array} Indices of the two most similar prefectures.
 */
function getMostSimilarPrefectures(index, matrix) {
    const similarities = matrix[index]
        .map((value, idx) => ({ index: idx, value }))
        .filter(item => item.index !== index); // Exclude self-comparison
    similarities.sort((a, b) => b.value - a.value); // Sort descending
    return [similarities[0].index, similarities[1].index];
}


/**
 * Initializes the application by fetching data and logging it to the console.
 */
async function init() {
    try {
        // Fetch and store globally for app-wide access
        const fetchedData = await fetchData();

        // If the JSON doesn't already contain image_paths, create them dynamically
        // using the `createImagePaths` helper so downstream code can assume
        // `data.image_paths` always exists.
        if (!Array.isArray(fetchedData.image_paths) && Array.isArray(fetchedData.prefectures)) {
            fetchedData.image_paths = createImagePaths(fetchedData.prefectures);
        }

        globalThis.data = fetchedData;
        console.log('Fetched Data (global):', globalThis.data);
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

init();

/**
 * Helper accessor for read-only code wanting the loaded data.
 * Returns the global data object (may be null before init completes).
 * @returns {Object|null}
 */
function getData() {
    return globalThis.data;
}

// Export for module consumers just in case script.js is loaded as a module.
if (typeof window !== 'undefined') {
    window.getData = getData;
    // Allow other front-end code to build image paths if needed
    window.createImagePaths = createImagePaths;
    window.getMostSimilarPrefectures = getMostSimilarPrefectures;
}
