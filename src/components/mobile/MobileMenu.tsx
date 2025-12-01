import { Option, Step, ThemeTemplateGroup, useZakeke } from '@zakeke/zakeke-configurator-react';
import { T, useActualGroups, useUndoRedoActions, useUndoRegister } from 'Helpers';
import { Map } from 'immutable';
import { useEffect, useState } from 'react';
import useStore from 'Store';
import styled from 'styled-components';
import savedCompositionsIcon from '../../assets/icons/saved_designs.svg';
import star from '../../assets/icons/star.svg';
import noImage from '../../assets/images/no_image.png';
import Designer from '../layout/Designer';
import DesignsDraftList from '../layout/DesignsDraftList';
import { ItemName, Template, TemplatesContainer } from '../layout/SharedComponents';
import Steps from '../layout/Steps';
import { MenuItem, MobileItemsContainer } from './MobileMenuComponents';
import TemplateGroup from 'components/TemplateGroup';

// Styled component for the container of the mobile menu
export const MobileMenuContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	position: relative;
	overflow: auto;
	background: #f4f4f4;
	border-top-left-radius: 10px;
    border-top-right-radius: 10px;
	box-shadow: 0px 0px 4px 0px #A0805A;
`;

// Styled component for the container of the steps
export const StepsMobileContainer = styled.div`
	border-top: 1px #fff solid;
	height: 45px;
	background: white;
`;

// Styled component for the container of the price info text
const PriceInfoTextContainer = styled.div`
	font-size: 14px;
	padding: 0px 10px;
	background: white;
`;

// Backdrop overlay
const BackdropOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.4);
	z-index: 998;
`;

// Close button
const CloseButton = styled.button`
  position: fixed;
  right: 10px;   
  max-width: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
  z-index: 10;

  &:hover {
    background: #e0e0e0;
  }
`;

// Section container
const SectionContainer = styled.div`
	margin-bottom: 15px;
`;

// Section title
const SectionTitle = styled.h2`
	font-size: 14px;
	font-weight: 600;
	color: #1a1a1a;
	margin: 0 0 6px 0;
	padding-right: 40px;
`;

// Section subtitle
const SectionSubtitle = styled.div`
	font-size: 12px;
	color: #000;
	font-weight:700;
	margin-bottom: 6px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

// Selected option display for circle options
const SelectedOptionDisplay = styled.div`
	font-size: 11px;
	color: #000;
	font-weight: 500;
	margin-bottom: 8px;
	
	span {
		color: #A0805A;
		font-weight: 700;
	}
`;

// Grid container for options
const OptionsGrid = styled.div<{ columns?: number }>`

	width: 100%;
	display: flex;
	overflow-x: auto;
	margin-bottom: 10px;
  /* display: grid;
  justify-content: center;

  grid-template-columns: repeat(${props => props.columns || 3}, 1fr); */
  gap: ${props => (props.columns === 6 ? '3px' : '12px')}; // smaller gap for circles
  margin-bottom: 10px;
`;

// Option card wrapper to include image and label
const OptionCardWrapper = styled.div`
/* width: 100px;
height: 100px; */
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
`;

// Option card
const OptionCard = styled.button<{ selected?: boolean; isRound?: boolean; columns?: number }>`
  background: white;
  border: 2px solid ${props => props.selected ? '#A0805A' : '#e0e0e0'}; /* always show 2px border */
  border-radius: ${props => (props.columns === 6 ? '50%' : '12px')};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  /* height: ${props => (props.columns === 6 ? '55px' : `80px`)}; */
  /* width: ${props => (props.columns === 6 ? '55px' : `100%`)}; */
  /* padding: ${props => (props.columns === 6 ? '3.4px' : `6px`)}; */

  &:hover {
    border-color: ${props => (props.columns === 6 ? 'none' : (props.selected ? '#A0805A' : '#A0805A'))};
    transform: translateY(-2px);
    box-shadow: ${props => (props.columns === 6 ? 'none' : '0 4px 12px rgba(160, 128, 90, 0.2)')};
  }

  &:active {
    transform: translateY(0);
  }
`;

// Option image container
const OptionImageContainer = styled.div<{ isRound?: boolean }>`
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	border-radius: ${props => props.isRound ? '50%' : '8px'};
	background: #f8f8f8;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

// Option label - updated to accept columns prop
const OptionLabel = styled.div<{ columns?: number }>`
	font-size: ${props => (props.columns === 3 ? '12px' : '9px')};
	font-weight: 500;
	color: #333;
	text-align: center;
	line-height: 1.2;
	max-width: ${props => (props.columns === 3 ? '90px' : '55px')};
	word-wrap: break-word;
`;

// Color swatch for color options
const ColorSwatch = styled.div<{ color?: string; isRound?: boolean }>`
	width: 60px;
	height: 60px;
	border-radius: ${props => props.isRound ? '50%' : '8px'};
	background: ${props => props.color || '#ccc'};
	border: 1px solid #e0e0e0;
`;

// Large option card (for categories like Body, Sides, Front)
const LargeOptionCard = styled(OptionCard)`
	padding: 20px 16px;
	min-height: 120px;
`;

// Horizontal separator
const Separator = styled.div`
	border: 1px solid #A0805A;
	margin: 14px 0;
`;

// Full view content container (integrated inline)
const FullViewContent = styled.div`
	padding: 15px;
	overflow-y: auto;
	background: white;
	width: 100%;
	flex: 1;
	position:fixed;
	max-height:40%;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
	box-shadow: 0px 4px 29.4px 0px #A0805A;
	margin-bottom: 105px;
`;

// MobileMenu component that represents the mobile menu where
// the customer can select the attributes and options
const MobileMenu = () => {
	const {
		isSceneLoading,
		templates,
		currentTemplate,
		setCamera,
		setTemplate,
		sellerSettings,
		selectOption,
		draftCompositions
	} = useZakeke();
	const {
		selectedGroupId,
		setSelectedGroupId,
		selectedAttributeId,
		setSelectedAttributeId,
		selectedStepId,
		setSelectedStepId,
		isUndo,
		isRedo,
		setSelectedTemplateGroupId,
		selectedTemplateGroupId,
		lastSelectedItem,
		setLastSelectedItem
	} = useStore();
	const [scrollLeft, setScrollLeft] = useState<number | null>(null);
	const [optionsScroll, setOptionsScroll] = useState<number | null>(null);
	const [attributesScroll, setAttributesScroll] = useState<number | null>(null);
	const [isTemplateEditorOpened, setIsTemplateEditorOpened] = useState(false);
	const [isDesignsDraftListOpened, setisDesignsDraftListOpened] = useState(false);
	const [isTemplateGroupOpened, setIsTemplateGroupOpened] = useState(false);
	const [isStartRegistering, setIsStartRegistering] = useState(false);
	const [showFullView, setShowFullView] = useState(false);
	const undoRegistering = useUndoRegister();
	const undoRedoActions = useUndoRedoActions();

	const actualGroups = useActualGroups() ?? [];

	const selectedGroup = selectedGroupId ? actualGroups.find((group) => group.id === selectedGroupId) : null;
	const selectedStep = selectedGroupId
		? actualGroups.find((group) => group.id === selectedGroupId)?.steps.find((step) => step.id === selectedStepId)
		: null;
	const currentAttributes = selectedStep ? selectedStep.attributes : selectedGroup ? selectedGroup.attributes : [];
	const currentTemplateGroups = selectedStep
		? selectedStep.templateGroups
		: selectedGroup
			? selectedGroup.templateGroups
			: [];

	const currentItems = [...currentAttributes, ...currentTemplateGroups].sort(
		(a, b) => a.displayOrder - b.displayOrder
	);

	const selectedAttribute = currentAttributes
		? currentAttributes.find((attr) => attr.id === selectedAttributeId)
		: null;

	const selectedTemplateGroup = currentTemplateGroups
		? currentTemplateGroups.find((templGr) => templGr.templateGroupID === selectedTemplateGroupId)
		: null;

	const options = selectedAttribute?.options ?? [];
	const groupIndex = actualGroups && selectedGroup ? actualGroups.indexOf(selectedGroup) : 0;

	const [lastSelectedSteps, setLastSelectedSteps] = useState(Map<number, number>());

	const handleNextGroup = () => {
		if (selectedGroup) {
			if (groupIndex < actualGroups.length - 1) {
				const nextGroup = actualGroups[groupIndex + 1];
				handleGroupSelection(nextGroup.id);
			}
		}
	};

	const handlePreviousGroup = () => {
		if (selectedGroup) {
			if (groupIndex > 0) {
				let previousGroup = actualGroups[groupIndex - 1];
				handleGroupSelection(previousGroup.id);

				// Select the last step
				if (previousGroup.steps.length > 0)
					handleStepSelection(previousGroup.steps[previousGroup.steps.length - 1].id);
				else if (previousGroup.attributes.length > 0)
					handleAttributeSelection(previousGroup.attributes[previousGroup.attributes.length - 1].id);
				else if (previousGroup.templateGroups.length > 0)
					handleTemplateGroupSelection(
						previousGroup.templateGroups[previousGroup.templateGroups.length - 1].templateGroupID
					);
			}
		}
	};

	const handleStepChange = (step: Step | null) => {
		if (step) handleStepSelection(step.id);
	};

	const handleGroupSelection = (groupId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (groupId && selectedGroupId !== groupId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'group', id: selectedGroupId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'group', id: groupId, direction: 'redo' });
		}

		setSelectedGroupId(groupId);
		setShowFullView(!!groupId);
		//Reset scrollbar for iphone bug
		setScrollLeft(0);
		setAttributesScroll(0);
		setOptionsScroll(0);
	};

	const handleStepSelection = (stepId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (selectedStepId !== stepId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'step', id: selectedStepId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'step', id: stepId ?? null, direction: 'redo' });
		}

		setSelectedStepId(stepId);

		const newStepSelected = lastSelectedSteps.set(selectedGroupId!, stepId!);
		setLastSelectedSteps(newStepSelected);
		//Reset scrollbar for iphone bug
		setScrollLeft(0);
		setAttributesScroll(0);
		setOptionsScroll(0);
	};

	const handleAttributeSelection = (attributeId: number) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (attributeId && selectedAttributeId !== attributeId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'attribute', id: selectedAttributeId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'attribute', id: attributeId, direction: 'redo' });
		}

		setSelectedAttributeId(attributeId);
		setLastSelectedItem({ type: 'attribute', id: attributeId });
		//Reset scrollbar for iphone bug
		setScrollLeft(0);
		setAttributesScroll(0);
		setOptionsScroll(0);
	};

	const handleTemplateGroupSelection = (templateGroupId: number | null) => {
		setSelectedTemplateGroupId(templateGroupId);
		setLastSelectedItem({ type: 'template-group', id: templateGroupId });
		setIsTemplateGroupOpened(true);
	};

	const handleOptionSelection = (option: Option) => {
		const undo = undoRegistering.startRegistering();
		undoRedoActions.eraseRedoStack();
		undoRedoActions.fillUndoStack({
			type: 'option',
			id: options.find((opt) => opt.selected)?.id ?? null,
			direction: 'undo'
		});
		undoRedoActions.fillUndoStack({ type: 'option', id: option.id, direction: 'redo' });

		selectOption(option.id);
		undoRegistering.endRegistering(undo);

		try {
			if ((window as any).algho) (window as any).algho.sendUserStopForm(true);
		} catch (e) { }
	};

	const setTemplateByID = async (templateID: number) => await setTemplate(templateID);

	// Initial template selection
	useEffect(() => {
		if (templates.length > 0 && !currentTemplate) setTemplateByID(templates[0].id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templates]);

	// auto-selection if there is only 1 group
	useEffect(() => {
		if (actualGroups && actualGroups.length === 1 && actualGroups[0].id === -2) return;
		else if (actualGroups && actualGroups.length === 1 && !selectedGroupId) setSelectedGroupId(actualGroups[0].id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actualGroups, selectedGroupId]);

	// Reset attribute selection when group selection changes
	useEffect(() => {
		if (selectedGroup && selectedGroup.id !== -2) {
			if (selectedGroup.steps.length > 0) {
				if (
					lastSelectedSteps.get(selectedGroupId!) &&
					selectedGroup.steps.find((step) => step.id === lastSelectedSteps.get(selectedGroupId!)!)
				)
					handleStepSelection(lastSelectedSteps.get(selectedGroupId!)!);
				else {
					handleStepSelection(selectedGroup.steps[0].id);
					if (
						selectedGroup.steps[0].attributes.length === 1 &&
						selectedGroup.steps[0].templateGroups.length === 0
					)
						handleAttributeSelection(selectedGroup.steps[0].attributes[0].id);
					else if (
						selectedGroup.steps[0].templateGroups.length === 1 &&
						selectedGroup.steps[0].attributes.length === 0
					)
						handleTemplateGroupSelection(selectedGroup.steps[0].templateGroups[0].templateGroupID);
				}
			} else {
				handleStepSelection(null);
				if (selectedGroup.attributes.length === 1 && selectedGroup.templateGroups.length === 0)
					handleAttributeSelection(selectedGroup.attributes[0].id);
				else if (selectedGroup.templateGroups.length === 1 && selectedGroup.attributes.length === 0)
					handleTemplateGroupSelection(selectedGroup.templateGroups[0].templateGroupID);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGroup?.id]);
	// Auto select first actualGroup on load
	useEffect(() => {
		if (actualGroups.length > 0 && !selectedGroupId) {
			const firstGroup = actualGroups[0];
			handleGroupSelection(firstGroup.id);
		}
	}, [actualGroups]);

	useEffect(() => {
		if (selectedGroup?.id === -2) {
			setIsTemplateEditorOpened(true);
		}
	}, [selectedGroup?.id]);

	useEffect(() => {
		if (selectedGroup?.id === -3) {
			setisDesignsDraftListOpened(true);
		}
	}, [selectedGroup?.id]);

	// Camera
	useEffect(() => {
		if (!isSceneLoading && selectedGroup && selectedGroup.cameraLocationId) {
			setCamera(selectedGroup.cameraLocationId, false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGroup?.id, isSceneLoading]);

	useEffect(() => {
		if (selectedGroup && selectedGroup.steps.length > 0) {
			if (
				selectedGroup.steps.find((step) => step.id === selectedStep?.id) &&
				selectedGroup.steps.find((step) => step.id === selectedStep?.id)?.attributes.length === 1 &&
				selectedGroup.steps.find((step) => step.id === selectedStep?.id)?.templateGroups.length === 0
			)
				handleAttributeSelection(
					selectedGroup.steps!.find((step) => step.id === selectedStep?.id)!.attributes[0].id
				);
			else setSelectedAttributeId(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedStep?.id]);

	useEffect(() => {
		if (isStartRegistering) {
			undoRegistering.endRegistering(false);
			setIsStartRegistering(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isStartRegistering]);

	// Helper function to get selected option name
	const getSelectedOptionName = (options: Option[]) => {
		const selected = options.find(opt => opt.selected);
		return selected ? T._d(selected.name) : null;
	};

	// Render inline full view content (no fixed overlay)
	const renderFullViewContent = () => {
		if (!selectedGroup || !showFullView || selectedGroup.id === -2 || selectedGroup.id === -3) return null;

		// Create an array to track attribute indices
		let attributeCounter = 0;

		return (
			<FullViewContent>
				<div className="flex items-center py-1">
					<CloseButton
						onClick={() => {
							setShowFullView(false);
							setSelectedGroupId(null);
						}}
					>
						<svg width="70" height="70" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
							<g filter="url(#filter0_d_63_94)">
								<rect x="13.8999" y="9.90002" width="31" height="31" rx="15.5" fill="white" />
								<path d="M24.8325 29.9661L33.9672 20.834M24.8325 20.834L33.9672 29.9661" stroke="black" stroke-width="1.5" stroke-linecap="round" />
							</g>
							<defs>
								<filter id="filter0_d_63_94" x="-9.72748e-05" y="2.47955e-05" width="58.8" height="58.8" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
									<feFlood flood-opacity="0" result="BackgroundImageFix" />
									<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
									<feOffset dy="4" />
									<feGaussianBlur stdDeviation="6.95" />
									<feComposite in2="hardAlpha" operator="out" />
									<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
									<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_63_94" />
									<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_63_94" result="shape" />
								</filter>
							</defs>
						</svg>
					</CloseButton>

					{/* <SectionTitle>{selectedGroup.name ? T._d(selectedGroup.name) : 'Customize'}</SectionTitle> */}
				</div>

				{currentItems.map((item, index) => {
					if (item instanceof ThemeTemplateGroup) {
						return (
							<SectionContainer key={item.templateGroupID}>
								<SectionSubtitle>{T._d(item.name)}</SectionSubtitle>
								<OptionsGrid columns={3}>
								</OptionsGrid>
								{index < currentItems.length - 1 && <Separator />}
							</SectionContainer>
						);
					} else {
						const attribute = item;
						const currentAttributeIndex = attributeCounter;
						attributeCounter++;

						// Determine columns based on attribute index
						// Index 0 = 3 columns, Index 1 = 6 columns
						const columns = currentAttributeIndex === 0 ? 3 : 6;
						const isRound = currentAttributeIndex === 1;
						const showOptionNames = columns === 3; // Only show individual names for 3-column layout
						const selectedOptionName = getSelectedOptionName(attribute.options);

						return (
							<SectionContainer key={attribute.id}>
								{/* <SectionSubtitle>{T._d(attribute.name)}</SectionSubtitle> */}

								{!showOptionNames && selectedOptionName && (
									<SelectedOptionDisplay>
										Selected Option: <span>{selectedOptionName}</span>
									</SelectedOptionDisplay>
								)}

								<OptionsGrid columns={columns}>
									{attribute.options.map(option =>
										option.enabled && (
											<OptionCardWrapper key={option.id}>
												<OptionCard
													selected={option.selected}
													isRound={isRound}
													columns={columns}
													onClick={() => handleOptionSelection(option)}
												>
													{option.imageUrl ? (
														<OptionImageContainer isRound={isRound}>
															<img src={option.imageUrl} alt={T._d(option.name)} />
														</OptionImageContainer>
													) : (
														<ColorSwatch isRound={isRound} />
													)}
												</OptionCard>

												{showOptionNames && (
													<OptionLabel columns={columns}>{T._d(option.name)}</OptionLabel>
												)}
											</OptionCardWrapper>
										)
									)}
								</OptionsGrid>
								{index < currentItems.length - 1 && <Separator />}
							</SectionContainer>
						);
					}
				})}
			</FullViewContent>
		);
	};

	return (
		<MobileMenuContainer>
			{sellerSettings && sellerSettings.priceInfoText && (
				<PriceInfoTextContainer dangerouslySetInnerHTML={{ __html: sellerSettings.priceInfoText }} />
			)}

			<MobileItemsContainer
				isLeftArrowVisible
				isRightArrowVisible
				scrollLeft={scrollLeft ?? 0}
				onScrollChange={(value) => setScrollLeft(value)}
			>
				{actualGroups.map((group) => {
					if (group)
						return (
							<MenuItem
								key={group.guid}
								imageUrl={
									group.id === -3 ? savedCompositionsIcon : group.imageUrl ? group.imageUrl : star
								}
								label={group.name ? T._d(group.name) : T._('Customize', 'Composer')}
								selected={group.id === selectedGroupId}
								onClick={() => handleGroupSelection(group.id)}
							/>
						);
					else return null;
				})}
			</MobileItemsContainer>

			{selectedGroup && selectedGroup.id !== -2 && selectedGroup.steps && selectedGroup.steps.length > 0 && (
				<StepsMobileContainer>
					<Steps
						key={'steps-' + selectedGroup?.id}
						hasNextGroup={groupIndex !== actualGroups.length - 1}
						hasPreviousGroup={groupIndex !== 0}
						onNextStep={handleNextGroup}
						onPreviousStep={handlePreviousGroup}
						currentStep={selectedStep}
						steps={selectedGroup.steps}
						onStepChange={handleStepChange}
					/>
				</StepsMobileContainer>
			)}

			{selectedGroup && selectedGroup.id === -2 && templates.length > 1 && (
				<TemplatesContainer>
					{templates.map((template) => (
						<Template
							key={template.id}
							selected={currentTemplate === template}
							onClick={async () => {
								await setTemplate(template.id);
							}}
						>
							{T._d(template.name)}
						</Template>
					))}
				</TemplatesContainer>
			)}

			{renderFullViewContent()}

			{selectedGroup?.id === -2 && isTemplateEditorOpened && (
				<Designer
					onCloseClick={() => {
						setIsTemplateEditorOpened(false);
						handleGroupSelection(null);
					}}
				/>
			)}

			{draftCompositions && selectedGroup?.id === -3 && isDesignsDraftListOpened && (
				<DesignsDraftList
					onCloseClick={() => {
						setisDesignsDraftListOpened(false);
						handleGroupSelection(null);
					}}
				/>
			)}
		</MobileMenuContainer>
	);
};

export default MobileMenu;