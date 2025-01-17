const express = require("express");
const fs = require("fs");
const cors = require('cors');

const app = express();
const port = 5000;
const path = require('path');

const tf_idf_filePath = __dirname + "/data/Vectorized_Documents.txt";
const Words_filePath = __dirname + "/data/Words.txt";
const Title_filePath = __dirname + "/data/Title.txt";
const Links_filePath = __dirname + "/data/Links.txt";

const Vectorized_Documents = Load_Vectorized_Documents(tf_idf_filePath);
const Words = LoadFile(Words_filePath);
const Title = LoadFile(Title_filePath);
const Links = LoadFile(Links_filePath);

app.use(cors());
app.use(express.json());

app.listen(port, () => console.log(`listening on port ${port}`));

app.get('/api/search', (req, res) => {
    res.json(PerformSearch(req.query.q))
});

function PerformSearch(searchTerm) {
    const query = searchTerm.toLowerCase().split(" ");
    const queryVector = VectorizedQuery(query, Words);
    const similarity = calculateSimilarity(queryVector, Vectorized_Documents);
    const SortedDocumentIndex = calculateDocumentOrder(similarity);
    const ProcessedResult = ProcessResult(SortedDocumentIndex, Title, Links);
    return ProcessedResult;
}
  

function VectorizedQuery(query, words) {
    const newVector = [];

    for (const word of words) {
        let flag = false;
        for (const queryString of query) {
            if (queryString === word) {
                flag = true;
                break;
            }
        }
        if (flag) {
            newVector.push(1);
        } else {
            newVector.push(0);
        }
    }

    return newVector;
}

function dotProduct(vector1, vector2) {
    let result = 0;
    for (let i = 0; i < vector1.length; i++) {
        result += vector1[i] * vector2[i];
    }
    return result;
}

function magnitude(vector) {
    let sumOfSquares = 0;
    for (let i = 0; i < vector.length; i++) {
        sumOfSquares += vector[i] * vector[i];
    }
    return Math.sqrt(sumOfSquares);
}

function calculateSimilarity(queryVector, vectorizationMatrix) {
    const similarityMat = [];
    for (const vector of vectorizationMatrix) {
        const dotProd = dotProduct(queryVector, vector);
        const magnitude1 = magnitude(queryVector);
        const magnitude2 = magnitude(vector);

        if (magnitude1 === 0 || magnitude2 === 0) {
            similarityMat.push(0);
            continue;
        }

        const similarity = dotProd / (magnitude1 * magnitude2);
        similarityMat.push(similarity);
    }
    return similarityMat;
}

function calculateDocumentOrder(similarity) {
    let similarityScoreDocumentDict = {};
    let index = 1;
    for (const score of similarity) {
        similarityScoreDocumentDict[index] = score;
        index += 1;
    }
    const entries = Object.entries(similarityScoreDocumentDict);

    entries.sort((a, b) => b[1] - a[1]);

    const SortedDocumentIndex = [];
    for (const [key, value] of entries) {
        if (value > 0.0) {
            SortedDocumentIndex.push(key);
        }
    }

    const uniqueVector = [];

    for (const num of SortedDocumentIndex) {
        if (!uniqueVector.includes(num)) {
            uniqueVector.push(num);
        }
    }
    return uniqueVector;
}

function ProcessResult(SortedDocumentIndex, Title, Links) {
    var searchResults = [];
    for (const index of SortedDocumentIndex) {
        var result = { title: Title[index - 1], link: Links[index - 1] };
        searchResults.push(result);
    }
    return searchResults;
}

function Load_Vectorized_Documents(tf_idf_filePath) {
    const matrix = [];
    const rows = fs.readFileSync(tf_idf_filePath, "utf8").split("\n");
    // const rows = data.split('\n');

    for (let row of rows) {
        const values = row.trim().split(" ").map(parseFloat);
        matrix.push(values);
    }
    return matrix;
}

function LoadFile(filename) {
    const wordVector = [];
    const lines = fs.readFileSync(filename, "utf8").split("\n");

    for (const line of lines) {
        const word = line.trim();
        wordVector.push(word);
    }
    return wordVector;
}
