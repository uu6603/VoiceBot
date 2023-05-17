import "./App.css";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Footer from "./Components/Footer";

const synth = window.speechSynthesis;

function App() {
  const classifyItem = async ({ text }) => {
    const prompt = `Get the item of the last query using the below examples. Return null and only null if the question is incomplete and don't return anything else. Remove common words and return the uncommon words. Uncommon words are food items in this case

    Query: Search for Shahi Paneer
    Shahi Paneer
    
    Query: Search for ras malai
    Ras malai
    
    Query: Order Aloo ki sabzi 
    Aloo ki sabzi
    
    Query: Order for me kabab paratha
    Kabab paratha
    
    Query: I want to eat baingan ka bharta
    Baingan ka bharta
    
    Query: I am craving for khichdi
    Khichdi 
    
    Query: Let me have Pizza
    Pizza 
    
    Query: Recommend me places which serve good waffles
    Waffles
    
    Query: Good restaurants that serve healthy food
    Healthy food
    
    Query: Order for me pasta
    Pasta
    
    Query: Best tomato soup near me
    Tomato soup
    
    Query: Ice cream shops in Koramangala
    Ice cream
    
    Query: Best samosa places in Bangalore
    Samosa
    
    Query: Tea
    Tea
    
    Query: Chaat
    Chaat
    
    Query: Burger please
    Burger
    
    Query: Hello
    null
    
    Query: Hello can you hear me
    null
    
    Query: I want to order
    null
    
    Query: I want to eat 
    null
    
    Query: I am craving for 
    null
    
    Query: Let me have 
    null
    
    Query: Recommend me places which serve good 
    null
    
    Query: Good restaurants that serve 
    null
    
    ${text}`;

    const res = await axios.post(
      "https://79lm3hpao7.execute-api.ap-south-1.amazonaws.com/default/fetchAnswerFromChatGPT",
      {
        question: prompt,
      }
    );

    const utterThis = new SpeechSynthesisUtterance();

    if (res?.data?.answer === "null") {
      utterThis.text = `Please retry`;
      utterThis.rate = 0.75;

      synth.speak(utterThis);

      throw new Error();
    } else {
      utterThis.text = ` We were able to recognize that you are trying to order ${res?.data?.answer}`;
    }

    utterThis.rate = 0.75;

    synth.speak(utterThis);

    return res?.data?.answer;
  };

  const mutation = useMutation({
    mutationFn: classifyItem,
  });

  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript) {
      mutation.mutate({ text: transcript });
    }
  }, [transcript, listening]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="App">
      <div className="flex justify-center items-center h-screen flex-col relative">
        <div className="flex justify-center items-center">
          <div style={{ height: "50px", width: "50px" }}>
            <img src="icon.svg" height="100%" width="100%"></img>
          </div>{" "}
          <p className="heading"> VOICEBOT </p>
        </div>
        <div className="tagline">Say it, get it. Effortless shopping</div>
        {mutation?.isLoading ? (
          <span className="afterListeningText">"Processing your request" </span>
        ) : mutation?.isError ? (
          <>
            <span className="afterListeningText">Please retry &nbsp; </span>
            <KeyboardVoiceIcon
              fontSize="large"
              className="bg-black-500 text-white rounded-full shadow-lg hover:bg-blue-600 cursor-pointer"
              onClick={SpeechRecognition.startListening}
            />
          </>
        ) : null}

        {mutation?.isSuccess ? (
          <span className="afterListeningText">
            {" "}
            We were able to recognize that you are trying to order{" "}
            <span className="mutation">{mutation?.data}</span>{" "}
          </span>
        ) : null}
        {listening ? (
          <span className="afterListeningText">"Listening..." </span>
        ) : mutation?.status === "idle" ? (
          <>
            <div className="label"> Click on the Mic to Request </div>
            <KeyboardVoiceIcon
              fontSize="large"
              className="bg-black-500 text-white rounded-full shadow-lg hover:bg-blue-600 cursor-pointer"
              onClick={SpeechRecognition.startListening}
            />
          </>
        ) : null}
        <Footer />
      </div>
    </div>
  );
}

export default App;
