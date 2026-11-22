// // Wait for the DOM to fully load
// document.addEventListener("DOMContentLoaded", function () {
    
//     // Grab the elements
//     const summarizeButton = document.getElementById('summarizeBtn');
//     const summaryInput = document.getElementById('summaryInput');
//     const summaryOutput = document.getElementById('summaryOutput');

//     // Event listener for the summarize button
//     summarizeButton.addEventListener('click', function() {
//         // Get the input text
//         const inputText = summaryInput.value.trim();

//         // Check if input is not empty
//         if (inputText !== "") {
//             // Call the summarization function
//             summarizeText(inputText);
//         } else {
//             summaryOutput.textContent = "Please enter some text to summarize.";
//         }
//     });

//     // Function to summarize text
//     function summarizeText(text) {
//         // Placeholder logic for summarization
//         // You can replace this with any API or logic for summarization
//         const sentences = text.split('. ');
        
//         // Basic summarization: returning the first 3 sentences
//         const summary = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '');
        
//         // Display the summary
//         summaryOutput.textContent = summary;
//     }

// });
