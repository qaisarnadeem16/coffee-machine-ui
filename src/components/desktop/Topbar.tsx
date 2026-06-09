import styled from "styled-components";
import { Button } from "components/Atomic";
import { TailSpin } from "react-loader-spinner";
import { NftForm, TryOnMode, useZakeke } from "@zakeke/zakeke-configurator-react";
import useStore from "Store";
import { useEffect, useRef, useState } from "react";
import QuotationFormDialog from "components/dialogs/QuotationFormDialog";
import ErrorDialog from "components/dialogs/ErrorDialog";
import { MessageDialog, QuestionDialog, useDialogManager } from "components/dialogs/Dialogs";
import NFTDialog from "components/dialogs/NftDialog";
import { T } from "Helpers";
import ShareDialog from "components/dialogs/ShareDialog";
import SaveDesignsDraftDialog from "components/dialogs/SaveDesignsDraftDialog";
import PdfDialog from "components/dialogs/PdfDialog";
import { CustomQuotationConfirmMessage } from "components/layout/SharedComponents";
import useDropdown from "hooks/useDropdown";

const TopBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  align-items: center;
  padding:  10px;
//   height: 60px;
  border-bottom: 1px solid #CCB086;
   @media (max-width: 1024px) {
  
   
    border-bottom: none;
    padding:2px 10px;  
  }
`;

const PriceBox = styled.div`
//   border: 1.5px solid #A0805A;
//   border-radius: 9999px;
  padding: 7px 24px;
  font-size: 22px;
  font-weight: 700;
  color: #121715;
//   background-color: #fff;
`;

const AddToCartButton = styled(Button)`
  background-color: #CDA26E;
  border-radius: 2px;
  color: #fff;
  font-weight: 500;
  min-width: 160px;
  height: 40px;
  border: none;
  &:hover {
    background-color: #8a6c4c;
  }
`;

const TopBar = () => {

    // Custom hooks and state variables
    const [openOutOfStockTooltip, closeOutOfStockTooltip, isOutOfStockTooltipVisible, Dropdown] = useDropdown();
    const addToCartButtonRef = useRef<HTMLButtonElement>(null);
    const {
        useLegacyScreenshot,
        setCameraByName,
        getPDF,
        addToCart,
        isAddToCartLoading,
        sellerSettings,
        product,
        price,
        isOutOfStock,
        quantity,
        setQuantity,
        eventMessages,
        visibleEventMessages,
        additionalCustomProperties,
        saveComposition,
        createQuote,
        isMandatoryPD,
        getPrintingMethodsRestrictions,
        nftSettings
    } = useZakeke();
    const {
        setIsLoading,
        priceFormatter,
        isQuoteLoading,
        setIsQuoteLoading,
        isViewerMode,
        isDraftEditor,
        isEditorMode,
        setTryOnMode,
        tryOnRef,
        setIsPDStartedFromCart,
        pdValue,
        isSavingComposition,
        setIsSavingComposition
    } = useStore();
    const { showDialog, closeDialog } = useDialogManager();

    const pmRestrictions = getPrintingMethodsRestrictions();
    const pdfPreviewDisabled = pmRestrictions.isPDFPreviewEnabled === false;
    const [disableButtonsByVisibleMessages, setDisableButtonsByVisibleMessages] = useState(false);

    // Update the state variable disableButtonsByVisibleMessages based on visibleEventMessages
    useEffect(() => {
        if (visibleEventMessages && visibleEventMessages.some((msg) => msg.addToCartDisabledIfVisible))
            setDisableButtonsByVisibleMessages(true);
        else setDisableButtonsByVisibleMessages(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleEventMessages]);

    // Handle the "Add to Cart" button click event
    const handleAddToCart = () => {
        // Check if the product has mandatory personalization data and the value is less than 1
        if (isMandatoryPD && pdValue < 1) {
            setIsPDStartedFromCart(true);
            tryOnRef?.current?.setVisible?.(true);
            tryOnRef?.current?.changeMode?.(TryOnMode.PDTool);
            setTryOnMode(TryOnMode.PDTool);
            return;
        }
        // if you're saving a draft composition in backoffice
        if (isDraftEditor) {
            setIsSavingComposition(true);
            saveComposition().then(() => {
                setIsSavingComposition(false);
                showDialog(
                    'WelcomeMessage',
                    <MessageDialog alignButtons='center' message={T._('Composition saved successfully', 'Composer')} />
                );
            });
        }
        // Check if there is a cart message visible and show a confirmation dialog
        const cartMessage = eventMessages?.find((message) => message.eventID === 4);
        if (cartMessage && cartMessage.visible && !isDraftEditor && !isEditorMode)
            showDialog(
                'question',
                <QuestionDialog
                    alignButtons='center'
                    eventMessage={cartMessage?.description}
                    buttonNoLabel={T._('Cancel', 'Composer')}
                    buttonYesLabel={T._('Add to cart', 'Composer')}
                    onYesClick={() => {
                        // Check if NFT is enabled and show the NFT dialog
                        if (nftSettings && nftSettings.isNFTEnabled && !isDraftEditor)
                            showDialog(
                                'nft',
                                <NFTDialog
                                    nftTitle={T._(
                                        "You're purchasing a customized product together with an NFT.",
                                        'Composer'
                                    )}
                                    nftMessage={T._(
                                        'To confirm and mint your NFT you need an active wallet compatible with Ethereum. Confirm and add your email and wallet address.',
                                        'Composer'
                                    )}
                                    price={nftSettings.priceToAdd + price}
                                    buttonNoLabel={T._('Skip and continue', 'Composer')}
                                    buttonYesLabel={T._('Confirm and Purchase', 'Composer')}
                                    onYesClick={(nftForm: NftForm) => {
                                        closeDialog('nft');
                                        addToCart([], undefined, useLegacyScreenshot, nftForm);
                                    }}
                                    onNoClick={() => {
                                        closeDialog('nft');
                                        addToCart([], undefined, useLegacyScreenshot);
                                    }}
                                />
                            );
                        else addToCart([], undefined, useLegacyScreenshot);
                        closeDialog('question');
                    }}
                />
            );
        // If NFT is enabled, show the NFT dialog
        else if (nftSettings && nftSettings.isNFTEnabled && !isDraftEditor)
            showDialog(
                'nft',
                <NFTDialog
                    nftTitle={T._("You're purchasing a customized product together with an NFT.", 'Composer')}
                    nftMessage={T._(
                        'To confirm and mint your NFT you need an active wallet compatible with Ethereum. Confirm and add your email and wallet address.',
                        'Composer'
                    )}
                    price={nftSettings.priceToAdd + price}
                    buttonNoLabel={T._('Skip and continue', 'Composer')}
                    buttonYesLabel={T._('Confirm and Purchase', 'Composer')}
                    onYesClick={(nftForm: NftForm) => {
                        closeDialog('nft');
                        addToCart([], undefined, useLegacyScreenshot, nftForm);
                    }}
                    onNoClick={() => {
                        closeDialog('nft');
                        addToCart([], undefined, useLegacyScreenshot);
                    }}
                />
            );
        else {
            addToCart([], undefined, useLegacyScreenshot);
        }
    };

    // Show an error dialog
    const showError = (error: string) => {
        showDialog('error', <ErrorDialog error={error} onCloseClick={() => closeDialog('error')} />);
    };

    // Handle the "Share" button click event
    const handleShareClick = async () => {
        setCameraByName('buy_screenshot_camera', false, false);
        showDialog('share', <ShareDialog />);
    };

    // Handle the "Save" button click event
    const handleSaveClick = async () => {
        showDialog('save', <SaveDesignsDraftDialog onCloseClick={() => closeDialog('save')} />);
    };

    // Handle the "PDF" button click event
    const handlePdfClick = async () => {
        try {
            setIsLoading(true);
            const url = await getPDF();
            showDialog('pdf', <PdfDialog url={url} onCloseClick={() => closeDialog('pdf')} />);
        } catch (ex) {
            console.error(ex);
            showError(T._('Failed PDF generation', 'Composer'));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle the "Get a Quote" button click event
    const handleSubmitRequestQuote = async (formData: any) => {
        let thereIsARequiredFormEmpty = formData.some((form: any) => form.required && form.value === '');
        if (thereIsARequiredFormEmpty)
            showDialog(
                'error',
                <ErrorDialog
                    error={T._(
                        'Failed to send the quotation since there is at least 1 required field empty.',
                        'Composer'
                    )}
                    onCloseClick={() => closeDialog('error')}
                />
            );
        else
            try {
                closeDialog('request-quotation');
                setIsQuoteLoading(true);
                setCameraByName('buy_screenshot_camera', false, false);
                await saveComposition();
                await createQuote(formData);
                showDialog(
                    'message',
                    <MessageDialog
                        windowDecorator={CustomQuotationConfirmMessage}
                        message={T._('Request for quotation sent successfully', 'Composer')}
                    />
                );
                setIsQuoteLoading(false);
            } catch (ex) {
                console.error(ex);
                setIsQuoteLoading(false);
                showDialog(
                    'error',
                    <ErrorDialog
                        error={T._(
                            'An error occurred while sending request for quotation. Please try again.',
                            'Composer'
                        )}
                        onCloseClick={() => closeDialog('error')}
                    />
                );
            }
    };

    // Handle the "Get Quote" button click event
    const handleGetQuoteClick = async () => {
        let rule = product?.quoteRule;
        if (rule)
            showDialog(
                'request-quotation',
                <QuotationFormDialog getQuoteRule={rule} onFormSubmit={handleSubmitRequestQuote} />
            );
    };

    // Check if the "Add to Cart" button should be visible based on the quote rule
    const isBuyVisibleForQuoteRule = product?.quoteRule ? product.quoteRule.allowAddToCart : true;
    console.log('priceprice', price)
    return (
        <TopBarContainer>
            {/* <div className="flex lg:relative fixed top-0 left-0 right-0 z-20 bg-[#f4f4f4]  justify-between items-center w-full gap-2 "> */}
            {/* Price */}
            <div className="">
                {/* {price !== null && price > 0 && ( */}
                    <PriceBox>{priceFormatter.format(price)}</PriceBox>
                {/* )} */}
            </div>

            {/* Add to Cart */}
            <AddToCartButton
                ref={addToCartButtonRef}
                onClick={handleAddToCart}
                disabled={isAddToCartLoading || isOutOfStock}
            >
                {isAddToCartLoading ? (
                    <TailSpin color="#FFFFFF" height="25px" />
                ) : isOutOfStock ? (
                    "OUT OF STOCK"
                ) : (
                    "ADD TO CART"
                )}
            </AddToCartButton>
            {/* </div> */}
        </TopBarContainer>
    );
};

export default TopBar;
