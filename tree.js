const fs = require("fs");
const path = require("path");

function printTree(dir, prefix = "", maxDepth = 3, currentDepth = 0, ignore = ["node_modules", ".git", ".next", ".env"]) {
    if (currentDepth > maxDepth) return;

    try {
        const files = fs.readdirSync(dir);

        // Filter and sort files (directories first, then files)
        const filteredFiles = files
            .filter(file => !ignore.includes(file))
            .sort((a, b) => {
                const aPath = path.join(dir, a);
                const bPath = path.join(dir, b);
                const aIsDir = fs.statSync(aPath).isDirectory();
                const bIsDir = fs.statSync(bPath).isDirectory();

                // Directories first
                if (aIsDir && !bIsDir) return -1;
                if (!aIsDir && bIsDir) return 1;

                // Then alphabetical
                return a.localeCompare(b);
            });

        filteredFiles.forEach((file, index) => {
            const fullPath = path.join(dir, file);
            const isLast = index === filteredFiles.length - 1;

            try {
                const stat = fs.statSync(fullPath);
                const isDirectory = stat.isDirectory();
                const displayIcon = isDirectory ? "📁" : "📄";

                // Tree characters
                const connector = isLast ? "└── " : "├── ";
                const childPrefix = prefix + (isLast ? "    " : "│   ");

                // Create relative path for markdown link
                const relativePath = path.relative(".", fullPath).replace(/\\/g, "/");

                // Print current item
                console.log(`${prefix}${connector}${displayIcon} [${file}](${relativePath})`);

                // Recurse into directories
                if (isDirectory) {
                    printTree(fullPath, childPrefix, maxDepth, currentDepth + 1, ignore);
                }
            } catch (err) {
                // Handle permission errors or other file access issues
                console.log(`${prefix}${isLast ? "└── " : "├── "}❌ ${file} (Access Denied)`);
            }
        });
    } catch (err) {
        console.log(`❌ Error reading directory: ${dir}`);
    }
}

// Usage function with options
function generateTree(options = {}) {
    const {
        directory = ".",
        maxDepth = 3,
        ignore = ["node_modules", ".git", ".next", ".env", "dist", "build", ".vscode", ".idea"]
    } = options;

    const startDir = path.resolve(directory);
    const dirName = path.basename(startDir);

    console.log(`📁 ${dirName}/`);
    printTree(startDir, "", maxDepth, 0, ignore);
}

// Example usage:
generateTree();

// Advanced usage with custom options:
// generateTree({
//     directory: "./src",
//     maxDepth: 5,
//     ignore: ["node_modules", ".git", "*.log"]
// });

// Function to generate tree as string instead of console output
function getTreeAsString(dir, prefix = "", maxDepth = 3, currentDepth = 0, ignore = ["node_modules", ".git", ".next"]) {
    let result = "";

    if (currentDepth > maxDepth) return result;

    try {
        const files = fs.readdirSync(dir)
            .filter(file => !ignore.includes(file))
            .sort((a, b) => {
                const aPath = path.join(dir, a);
                const bPath = path.join(dir, b);
                const aIsDir = fs.statSync(aPath).isDirectory();
                const bIsDir = fs.statSync(bPath).isDirectory();

                if (aIsDir && !bIsDir) return -1;
                if (!aIsDir && bIsDir) return 1;
                return a.localeCompare(b);
            });

        files.forEach((file, index) => {
            const fullPath = path.join(dir, file);
            const isLast = index === files.length - 1;

            try {
                const stat = fs.statSync(fullPath);
                const isDirectory = stat.isDirectory();
                const displayIcon = isDirectory ? "📁" : "📄";

                const connector = isLast ? "└── " : "├── ";
                const childPrefix = prefix + (isLast ? "    " : "│   ");
                const relativePath = path.relative(".", fullPath).replace(/\\/g, "/");

                result += `${prefix}${connector}${displayIcon} [${file}](${relativePath})\n`;

                if (isDirectory) {
                    result += getTreeAsString(fullPath, childPrefix, maxDepth, currentDepth + 1, ignore);
                }
            } catch (err) {
                result += `${prefix}${isLast ? "└── " : "├── "}❌ ${file} (Access Denied)\n`;
            }
        });
    } catch (err) {
        result += `❌ Error reading directory: ${dir}\n`;
    }

    return result;
}

// Export functions if using as module
module.exports = {
    generateTree,
    printTree,
    getTreeAsString
};