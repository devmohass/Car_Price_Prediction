import {useState} from "react";

export default function App() {
  const [formData, setFormData] = useState({
    tax: "",
    mpg: "",
    engineSize: "",
    car_age: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    manufacturer: "",
    model: "",
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPredictedPrice(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Prediction failed");

      const data = await res.json();
      setPredictedPrice(data.predicted_price);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form pages configuration
  const pages = [
    {
      title: "Data one",
      fields: ["tax", "mpg", "engineSize", "car_age", "mileage"],
    },
    {
      title: "Data two",
      fields: ["manufacturer", "model", "fuelType", "transmission"],
    },
    {
      title: "Prediction Result",
      isReview: true,
    },
  ];

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderField = (key) => (
    <div key={key} className="mb-4">
      <label className="block text-gray-600 font-medium mb-1 capitalize">
        {key.replace("_", " ")}
      </label>
      <input
        name={key}
        value={formData[key]}
        onChange={handleChange}
        type={
          ["manufacturer", "model", "fuelType", "transmission"].includes(key)
            ? "text"
            : "number"
        }
        required
        className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
      />
    </div>
  );

  const renderReview = () => (
    <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Review Your Details
      </h2>
      <div className="space-y-3">
        {Object.entries(formData).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600 capitalize">
              {key.replace("_", " ")}:
            </span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🚗 Car Price Prediction
        </h1>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {pages.map((page, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === currentPage
                      ? "bg-purple-600 text-white"
                      : index < currentPage
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                  {index + 1}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    index === currentPage
                      ? "font-bold text-purple-600"
                      : "text-gray-500"
                  }`}>
                  {page.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{width: `${((currentPage + 1) / pages.length) * 100}%`}}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Current Page Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
              {pages[currentPage].title}
            </h2>

            {pages[currentPage].isReview ? (
              renderReview()
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pages[currentPage].fields.map(renderField)}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`px-6 py-3 rounded-xl font-medium transition duration-300 ${
                currentPage === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}>
              ← Previous
            </button>

            {currentPage < pages.length - 1 ? (
              <button
                type="button"
                onClick={nextPage}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition duration-300">
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition duration-300 disabled:opacity-50">
                {loading ? "Predicting..." : "Predict Price"}
              </button>
            )}
          </div>
        </form>

        {/* Result */}
        {predictedPrice !== null && (
          <div className="mt-8 p-5 bg-green-100 text-green-800 rounded-xl text-center text-2xl font-semibold shadow">
            💰 Predicted Price: ${predictedPrice}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-xl text-center font-medium shadow">
            {error}
          </div>
        )}

        {/* Quick Navigation Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentPage ? "bg-purple-600" : "bg-gray-300"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
