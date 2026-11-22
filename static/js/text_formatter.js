document.addEventListener("DOMContentLoaded", () => {
    const formatBtn = document.getElementById("formatBtn");
    const codeInput = document.getElementById("codeInput");
    const languageSelector = document.getElementById("languageSelector");
    const output = document.getElementById("formattedOutput");
    const copyBtn = document.getElementById("copyBtn");
    const resultContainer = document.getElementById("resultContainer");
    const spinner = document.getElementById("spinner");

    const languageParserMap = {
      javascript: "babel",
      typescript: "typescript",
      html: "html",
      css: "css",
      json: "json"
    };

    formatBtn.addEventListener("click", () => {
      const code = codeInput.value.trim();
      const selectedLang = languageSelector.value;
      const parser = languageParserMap[selectedLang];
      if (!parser || !code) return;

      spinner.classList.remove("hidden");
      setTimeout(() => {
        try {
          const formatted = prettier.format(code, {
            parser,
            plugins: prettierPlugins,
            semi: true,
            singleQuote: true
          });
          output.textContent = formatted;
          resultContainer.classList.remove("hidden");
        } catch (err) {
          output.textContent = "Error formatting: " + err.message;
          resultContainer.classList.remove("hidden");
        } finally {
          spinner.classList.add("hidden");
        }
      }, 500);
    });

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(output.value)
        .then(() => {
          copyBtn.textContent = "✅ Copied!";
          setTimeout(() => copyBtn.textContent = "📋 Copy", 2000);
        })
        .catch(err => {
          alert("Failed to copy: " + err);
        });
    });
  });

  