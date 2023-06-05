const News = require("../../../models/News");

function fidn_tw(doc) {
  var dlength = doc.length;
  var temp_array = new Array(dlength).fill(0);
  var dict = new Object();
  for (var i = 0; i < dlength; i++) {
    var data = doc[i]["description"];
    data = data.toLowerCase().split(" ");
    for (var d = 0; d < data.length; d++) {
      if (data[d] in dict) {
        dict[data[d]][i] += 1;
      } else {
        temp = temp_array.slice(0, dlength);
        dict[data[d]] = temp;
        dict[data[d]][i] += 1;
      }
    }
  }
  return dict;
}

function find_doc_vectors(dict, doc) {
  var wlength = Object.keys(dict).length;
  var temp_array = new Array(wlength).fill(0);
  var doc_vectors = new Object();
  words = Object.keys(dict);
  for (var i = 0; i < doc.length; i++) {
    temp = temp_array.slice(0, wlength);
    for (var w = 0; w < wlength; w++) {
      temp[w] = dict[words[w]][i];
    }
    doc_vectors[doc[i]["id"]] = temp;
  }
  return doc_vectors;
}

function distance(A, B) {
  var dotproduct = 0;
  var mA = 0;
  var mB = 0;
  for (i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  var similarity = dotproduct / (mA * mB);
  return similarity;
}

function find_clusters(doc_vectors, k, wlength, docs) {
  var temp_array = new Array(wlength).fill(0);
  var clusters = new Array(k);
  var means = new Array(k);
  temp_docs = docs.slice(0, docs.length);
  for (var i = 0; i < k; i++) {
    var pos = Math.floor(Math.random() * docs.length);
    var rand = docs[pos]["id"];
    docs.splice(pos, 1);
    means[i] = doc_vectors[rand];
  }

  var dlength = Object.keys(doc_vectors).length;
  var tab = new Array(dlength);
  for (var i = 0; i < dlength; i++) {
    var dist = 0.0;
    var pos = -1;
    for (var j = 0; j < means.length; j++) {
      d = distance(doc_vectors[temp_docs[i]["id"]], means[j]);
      if (dist <= d) {
        dist = d;
        pos = j;
      }
    }
    tab[i] = pos;
  }
  var ptab = tab.slice(0, tab.length);
  while (true) {
    for (var i = 0; i < means.length; i++) {
      sum = new Array(wlength).fill(0);
      no = 0;
      for (var j = 0; j < tab.length; j++) {
        if (tab[j] == i) {
          no++;
          // sum=      doc_vectors[temp_docs[i]["id"]]
          for (var w = 0; w < wlength; w++) {
            sum[w] += doc_vectors[temp_docs[j]["id"]][w];
          }
        }
      }
      if (no != 0) {
        for (var w = 0; w < wlength; w++) {
          sum[w] = sum[w] / no;
        }
      }
      means[i] = sum.slice(0, wlength);
    }

    // -----------

    dlength = Object.keys(doc_vectors).length;
    tab = new Array(dlength);
    for (var i = 0; i < dlength; i++) {
      var dist = 0.0;
      var pos = -1;
      for (var j = 0; j < means.length; j++) {
        d = distance(doc_vectors[temp_docs[i]["id"]], means[j]);
        if (dist <= d) {
          dist = d;
          pos = j;
        }
      }
      tab[i] = pos;
    }
    if (JSON.stringify(ptab) == JSON.stringify(tab)) {
      // console.log(tab,means);
      return [tab, means];
    }
    ptab = tab.slice(0, tab.length);
  }
}

function find_headings(clusters, docs, doc_vectors, k) {
  var headings = new Array(k);
  var hash = new Array(k);
  for (var i = 0; i < k; i++) {
    var dist = 0.0;
    var pos = -1;
    te = 0;
    for (var j = 0; j < docs.length; j++) {
      // console.log(clusters[0][j],i,docs.length)
      if (clusters[0][j] == i) {
        te++;
        d = distance(doc_vectors[temp_docs[j]["id"]], clusters[1][i]);
        if (d >= dist) {
          dist = d;
          pos = j;
        }
      }
    }
    hash[i] = te;
    headings[i] = docs[pos]["heading"];
  }
  console.log(headings);
  return [headings, hash];
}

function find_trend(k, doc) {
  if (k > doc.length) {
    k = doc.length;
  }
  var dict = fidn_tw(doc);
  var doc_vectors = find_doc_vectors(dict, doc);
  var clusters = find_clusters(
    doc_vectors,
    k,
    Object.keys(dict).length,
    doc.slice(0, doc.length)
  );
  var trend = find_headings(clusters, doc, doc_vectors, k);
  console.log(trend);
  return 0;
}

var doc = [
  {
    id: 1,
    heading: 1,
    description: "dindi sai karthik",
  },
  {
    id: 2,
    heading: 2,
    description: "hello friends chai peelo",
  },
  {
    id: 3,
    heading: 3,
    description: "please dont call me",
  },
  {
    id: 4,
    heading: 4,
    description: "call me twice",
  },
  {
    id: 5,
    heading: 5,
    description: "call me please",
  },
  {
    id: 6,
    heading: 6,
    description: "say me some thing",
  },
  {
    id: 7,
    heading: 7,
    description: "some value how good are you",
  },
  {
    id: 8,
    heading: 8,
    description: "some value hello there",
  },
];

// find_trend(5,doc)
