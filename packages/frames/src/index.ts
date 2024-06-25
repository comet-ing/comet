import {
    getFrameMessage,
    getFrameMetadata,
    FrameTransactionResponse,
    getFrameHtmlResponse,
} from "@coinbase/onchainkit/frame";
import { _validateRequestMessage } from "./utils.js";
import {
    _getStartCometFrameMetadata,
    _getStartCometHTMLResponse,
} from "./start-comet.js";

// UTILS
export const validateRequestMessage = _validateRequestMessage;

// START-COMET
export const getStartCometFrameMetadata = _getStartCometFrameMetadata;
export const getStartCometHTMLResponse = _getStartCometHTMLResponse;
