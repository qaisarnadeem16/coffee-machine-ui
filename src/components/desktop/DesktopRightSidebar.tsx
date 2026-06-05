import { Attribute, Option, Step, ThemeTemplateGroup } from '@zakeke/zakeke-configurator-react';
import { ReactComponent as AngleLeftSolid } from '../../assets/icons/angle-left-solid.svg';
import { ReactComponent as AngleRightSolid } from '../../assets/icons/angle-right-solid.svg';
import textIcon from '../../assets/icons/font-solid.svg';
import savedCompositionsIcon from '../../assets/icons/saved_designs.svg';
import star from '../../assets/icons/star.svg';
import OptionItem from '../widgets/Option';
import Designer from '../layout/Designer';

import { useZakeke } from '@zakeke/zakeke-configurator-react';
import { CarouselContainer, Icon } from 'components/Atomic';
import { T, useActualGroups, useUndoRedoActions, useUndoRegister } from 'Helpers';
import { Map } from 'immutable';
import React, { useEffect, useState } from 'react';
import useStore from 'Store';
import styled from 'styled-components';
import arrowDown from '../../assets/icons/angle-down-solid.svg';
import arrowUp from '../../assets/icons/angle-up-solid.svg';
import DesignsDraftList from '../layout/DesignsDraftList';
import {
	ArrowIcon,
	ItemAccordion,
	ItemAccordionName,
	ItemAccordionContainer,
	AttributeDescription,
	ItemContainer,
	ItemName,
	AttributesContainer,
	GroupIcon,
	GroupItem,
	GroupsContainer,
	Options,
	OptionsContainer,
	OptionSelectedName,
	ItemAccordionDescription
} from '../layout/SharedComponents';
import Steps from '../layout/Steps';
import TemplateGroup from 'components/TemplateGroup';
import TopBar from './Topbar';

export const DesktopRightSidebarContainer = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: flex-end;
	min-height: 0;

	@media (max-width: 1024px) {
		width: 100%;
		height: 50%;
		flex-direction: column;
		position: relative;
	}
`;

const SliderArrow = styled<React.FC<React.ComponentProps<typeof Icon> & { arrowDirection: 'left' | 'right' }>>(Icon)`
	background: white;
	border: 1px #eee solid;
	border-radius: 3px;
	position: relative;

	${(props) => props.arrowDirection === 'left' && `left: -28px`}
	${(props) => props.arrowDirection === 'right' && `right: -28px`}
`;

// Grid container for options - matching mobile design
const OptionsGrid = styled.div<{ columns?: number }>`
	display: grid;
	justify-content: center;
	grid-template-columns: repeat(${props => props.columns || 3}, 1fr);
	gap: ${props => (props.columns === 6 ? '6px' : '12px')};
	padding:10px 0px;
`;

// Option card wrapper to include image and label
const OptionCardWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
`;

// Option card - matching mobile design
const OptionCard = styled.button<{ selected?: boolean; isRound?: boolean; columns?: number }>`
	background: white;
	border: 3px solid ${props => props.selected ? '#CDA26E' : '#ffff'};
	border-radius: ${props => (props.columns === 6 ? '50%' : '2px')};
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content:center;
	gap: 8px;
	width: ${props => (props.columns === 6 ? '55px' : `100%`)};
	min-height: ${props => (props.columns === 6 ? '55px' : `80px`)};
	padding: ${props => (props.columns === 6 ? '2.4px' : `0px`)};
	background: #f8f8f8;

	&:hover {
		border-color: ${props => (props.columns === 6 ? 'none' : (props.selected ? '#A0805A' : '#A0805A'))};
		transform: translateY(-2px);
		box-shadow: ${props => (props.columns === 6 ? 'none' : '0 4px 12px rgba(160, 128, 90, 0.2)')};
	}

	&:active {
		transform: translateY(0);
	}
`;

// Option image container - matching mobile design
const OptionImageContainer = styled.div<{ isRound?: boolean }>`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	border-radius: ${props => props.isRound ? '50%' : '2px'};
	background: #f8f8f8;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

// Option label - matching mobile design - UPDATED to show outside the card
const OptionLabel = styled.div<{ columns?: number }>`
	font-size: ${props => (props.columns === 3 ? '12px' : '10px')};
	font-weight: 700;
	color: #333;
	text-align: center;
	line-height: 1.3;
	max-width: ${props => (props.columns === 3 ? '100px' : '60px')};
	word-wrap: break-word;
`;

// Color swatch for color options - matching mobile design
const ColorSwatch = styled.div<{ color?: string; isRound?: boolean }>`
	width: 60px;
	height: 60px;
	border-radius: ${props => props.isRound ? '50%' : '8px'};
	background: ${props => props.color || '#ccc'};
	border: 1px solid #e0e0e0;
`;

// This is the right sidebar component for the desktop layout
// that contains the list of groups, steps, attributes and options.
const DesktopRightSidebar = () => {
	const { isSceneLoading, templates, currentTemplate, setCamera, setTemplate, draftCompositions, selectOption } = useZakeke();

	const {
		setSelectedGroupId,
		selectedGroupId,
		setSelectedStepId,
		selectedStepId,
		setSelectedAttributeId,
		selectedAttributeId,
		isUndo,
		isRedo,
		setSelectedTemplateGroupId,
		selectedTemplateGroupId,
		lastSelectedItem,
		setLastSelectedItem
	} = useStore();
	const [selectedCarouselSlide, setSelectedCarouselSlide] = useState<number>(0);
	const [attributesOpened, setAttributesOpened] = useState<Map<number, boolean>>(Map());
	const [isStartRegistering, setIsStartRegistering] = useState(false);

	const [lastSelectedSteps, setLastSelectedSteps] = useState(Map<number, number>());
	const [lastSelectedItemsFromGroups, setLastSelectedItemsFromGroups] = useState(Map<number, [number, string]>());
	const [lastSelectedItemsFromSteps, setLastSelectedItemFromSteps] = useState(Map<number, [number, string]>());

	const actualGroups = useActualGroups();
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

	const undoRegistering = useUndoRegister();
	const undoRedoActions = useUndoRedoActions();
	const groupIndex = actualGroups && selectedGroup ? actualGroups.indexOf(selectedGroup) : 0;

	const handleNextStep = () => {
		if (selectedGroup) {
			if (groupIndex < actualGroups.length - 1) {
				const nextGroup = actualGroups[groupIndex + 1];
				handleGroupSelection(nextGroup.id);
			}
		}
	};

	const handlePreviousStep = () => {
		if (selectedGroup) {
			if (groupIndex > 0) {
				let previousGroup = actualGroups[groupIndex - 1];
				handleGroupSelection(previousGroup.id);

				// Select the last step
				if (previousGroup.steps.length > 0)
					handleStepSelection(previousGroup.steps[previousGroup.steps.length - 1].id);
			}
		}
	};

	const handleStepChange = (step: Step | null) => {
		if (step) handleStepSelection(step.id);
	};

	const handleGroupSelection = (groupId: number) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (groupId && selectedGroupId !== groupId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({
				type: 'group',
				id: selectedGroupId,
				direction: 'undo'
			});
			undoRedoActions.fillUndoStack({
				type: 'group',
				id: groupId ?? null,
				direction: 'redo'
			});
		}
		setSelectedGroupId(groupId);
	};

	const handleStepSelection = (stepId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (selectedStepId !== stepId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({
				type: 'step',
				id: selectedStepId,
				direction: 'undo'
			});
			undoRedoActions.fillUndoStack({
				type: 'step',
				id: stepId ?? null,
				direction: 'redo'
			});
		}

		setSelectedStepId(stepId);

		const newStepSelected = lastSelectedSteps.set(selectedGroupId!, stepId!);
		setLastSelectedSteps(newStepSelected);
	};

	const handleAttributeSelection = (attributeId: number, isAttributesVertical?: boolean) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (attributeId && selectedAttributeId !== attributeId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({
				type: 'attribute',
				id: selectedAttributeId,
				direction: 'undo'
			});
			undoRedoActions.fillUndoStack({
				type: 'attribute',
				id: attributeId,
				direction: 'redo'
			});
		}

		setSelectedAttributeId(attributeId);

		if (isAttributesVertical && !selectedGroup?.attributesAlwaysOpened) {
			setAttributesOpened(attributesOpened.set(attributeId, !attributesOpened.get(attributeId)));
		}

		if (selectedStep && selectedStep.attributes.find((attr) => attr.id === attributeId)) {
			const newLastAttributeSelected = lastSelectedItemsFromSteps.set(selectedStepId!, [
				attributeId,
				'attribute'
			]);
			setLastSelectedItemFromSteps(newLastAttributeSelected);
		} else {
			const newLastAttributeSelected = lastSelectedItemsFromGroups.set(selectedGroupId!, [
				attributeId,
				'attribute'
			]);
			setLastSelectedItemsFromGroups(newLastAttributeSelected);
		}
		setLastSelectedItem({ type: 'attribute', id: attributeId });
	};

	const handleTemplateGroupSelection = (templateGroupId: number, isTemplateVertical?: boolean) => {
		setSelectedTemplateGroupId(templateGroupId);
		setLastSelectedItem({ type: 'template-group', id: templateGroupId });
		if (isTemplateVertical && !selectedGroup?.attributesAlwaysOpened) {
			setAttributesOpened(attributesOpened.set(templateGroupId, !attributesOpened.get(templateGroupId)));
		}
		if (
			selectedStep &&
			selectedStep.templateGroups.find((templGr) => templGr.templateGroupID === templateGroupId)
		) {
			const newLastTemplateGroupSelected = lastSelectedItemsFromSteps.set(selectedStepId!, [
				templateGroupId,
				'template group'
			]);
			setLastSelectedItemFromSteps(newLastTemplateGroupSelected);
		} else {
			const newLastItemSelected = lastSelectedItemsFromGroups.set(selectedGroupId!, [
				templateGroupId,
				'template group'
			]);
			setLastSelectedItemsFromGroups(newLastItemSelected);
		}
	};

	const setTemplateByID = async (templateID: number) => await setTemplate(templateID);

	// Initial template selection
	useEffect(() => {
		if (templates.length > 0 && !currentTemplate) setTemplateByID(templates[0].id);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templates]);

	// Initial group selection
	useEffect(() => {
		if (!isSceneLoading && actualGroups.length > 0 && !selectedGroupId) {
			handleGroupSelection(actualGroups[0].id);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSceneLoading, actualGroups]);

	// Reset attribute selection when group selection changes
	useEffect(() => {
		if (selectedGroup && selectedGroup.id !== -2) {
			if (selectedGroup.steps.length > 0) {
				// verifico che ci fosse già uno step selezionato per quel gruppo E CHE LO STESSO sia visibile
				// prima di selezionarlo, altrimenti seleziono il primo step disponibile del gruppo
				if (
					lastSelectedSteps.get(selectedGroupId!) &&
					selectedGroup.steps.find((step) => step.id === lastSelectedSteps.get(selectedGroupId!)!)
				)
					handleStepSelection(lastSelectedSteps.get(selectedGroupId!)!);
				else handleStepSelection(selectedGroup.steps[0].id);
			} else {
				handleStepSelection(null);
			}

			setSelectedCarouselSlide(0);

			if (!actualGroups.find((group) => group.id === selectedGroupId)!.attributesAlwaysOpened) {
				let attributes: Attribute[] = [];
				let group = actualGroups.find((group) => group.id === selectedGroupId)!;
				if (group.attributes.length > 0) {
					attributes.push(group.attributes[0]);
				}
				if (group.steps.length > 0) {
					let stepsFirstAttributes = group.steps.map((step) => {
						if (step.attributes.length > 0) {
							return step.attributes[0];
						} else return null;
					});
					stepsFirstAttributes.forEach((attribute) => {
						if (attribute) attributes.push(attribute);
					});
				}
				if (attributes && attributes.length > 0) {
					// Add attributes in openedAttributes and set isOpened to true if already exists
					setAttributesOpened((prev) => {
						attributes.forEach((attribute) => {
							prev = prev.set(attribute.id, true);
						});

						return prev;
					});
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGroupId, selectedGroup?.steps.length]);

	// check at any changes if there are attributes that needs to be opened
	useEffect(() => {
		if (actualGroups) {
			let attributes: Attribute[] = [];

			actualGroups.forEach((group) => {
				if (group.direction === 1) {
					if (group.attributesAlwaysOpened)
						group.attributes
							.concat(group.steps.flatMap((s) => s.attributes))
							.map((attr) => attributes.push(attr));
				}
			});
			if (attributes.length > 0) {
				// Add attributes in openedAttributes and set isOpened to true if already exists
				setAttributesOpened((prev) => {
					attributes.forEach((attribute) => {
						prev = prev.set(attribute.id, true);
					});

					return prev;
				});
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actualGroups]);


	const options = selectedAttribute?.options ?? [];

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
	
// useEffect(() => {
//     if (actualGroups.length > 0 && !selectedGroupId) {
//         const firstGroup = actualGroups[0];
// 		console.log(firstGroup)
//         handleGroupSelection(firstGroup.id);
// 		handleOptionSelection(firstGroup?.attributes[0]?.options[0])
// 		// if (firstGroup?.attributes[1]?.cameraLocationId) {
// 		// 	setCamera(firstGroup?.cameraLocationId);
// 		// }
//     }
// }, [actualGroups]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (actualGroups.length > 0 && !isSceneLoading ) {
				const firstGroup = actualGroups[0];
				// handleGroupSelection(firstGroup.id);

				const firstOption = firstGroup?.attributes?.[0]?.options?.[0];
				if (firstOption) {
					handleOptionSelection(firstOption);
				}

				
			}
		}, 500); // 10000 ms = 10 seconds

		return () => clearTimeout(timer); // cleanup if component unmounts
	}, [isSceneLoading]);

	// Camera for groups
	useEffect(() => {
		if (!isSceneLoading && selectedGroup && selectedGroup.cameraLocationId) {
			setCamera(selectedGroup.cameraLocationId);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGroupId, isSceneLoading]);

	// Camera for attributes
	useEffect(() => {
		if (!isSceneLoading && selectedAttribute && selectedAttribute.cameraLocationId) {
			setCamera(selectedAttribute.cameraLocationId);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAttribute, !isSceneLoading]);

	// select an attribute if selected step or group change
	useEffect(() => {
		if (selectedStep && currentItems.length > 0) {
			if (lastSelectedItemsFromSteps && selectedStepId && lastSelectedItemsFromSteps.get(selectedStepId!)) {
				const selectedItem = lastSelectedItemsFromSteps.get(selectedStepId!);
				if (selectedItem && selectedItem[1] === 'attribute') {
					if (selectedStep.attributes.some((attr) => attr.id === selectedItem[0]))
						handleAttributeSelection(lastSelectedItemsFromSteps!.get(selectedStepId!)![0]!);
					else handleAttributeSelection(selectedStep.attributes[0].id);
				}
				if (selectedItem && selectedItem[1] === 'template group') {
					if (selectedStep.templateGroups.some((templGr) => templGr.templateGroupID === selectedItem[0]))
						handleTemplateGroupSelection(lastSelectedItemsFromSteps!.get(selectedStepId!)![0]!);
					else handleTemplateGroupSelection(selectedStep.templateGroups[0].templateGroupID);
				}
			} else {
				if (!(currentItems[0] instanceof ThemeTemplateGroup)) handleAttributeSelection(currentItems[0].id);
				else handleTemplateGroupSelection(currentItems[0].templateGroupID);
			}
		} else if (selectedGroup && currentItems.length > 0) {
			if (lastSelectedItemsFromSteps && selectedGroupId && lastSelectedItemsFromGroups.get(selectedGroupId)) {
				const selectedItem = lastSelectedItemsFromGroups.get(selectedGroupId);
				if (selectedItem && selectedItem[1] === 'attribute') {
					const attributeToBeAutoSelected = selectedGroup.attributes.find(
						(attr) => attr.id === selectedItem[0]
					);
					// fix check if enabled in case of attributes with link
					if (attributeToBeAutoSelected && attributeToBeAutoSelected.enabled)
						handleAttributeSelection(lastSelectedItemsFromGroups!.get(selectedGroupId!)![0]!);
					else if (selectedGroup && selectedGroup.attributes.length > 0)
						handleAttributeSelection(selectedGroup.attributes[0].id);
				}
				if (selectedItem && selectedItem[1] === 'template group') {
					if (selectedGroup.templateGroups.some((templGr) => templGr.templateGroupID === selectedItem[0]))
						handleTemplateGroupSelection(lastSelectedItemsFromGroups!.get(selectedGroupId!)![0]!);
				}
			} else {
				if (!(currentItems[0] instanceof ThemeTemplateGroup))
					handleAttributeSelection(selectedGroup.attributes[0].id);
				else handleTemplateGroupSelection(currentItems[0].templateGroupID);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedStepId, selectedGroupId]);

	useEffect(() => {
		if (isStartRegistering) {
			undoRegistering.endRegistering(false);
			setIsStartRegistering(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isStartRegistering]);

	
	const getSelectedOptionName = (attribute: Attribute) => {
		const selected = attribute.options.find(opt => opt.selected);
		return selected ? T._d(selected.name) : null;
	};

	const renderOptionsGrid = (attribute: Attribute, attributeIndex: number) => {
		const columns = attributeIndex === 0 ? 3 : 6;
		const isRound = attributeIndex === 1;
		const showOptionNames = columns === 3; // Only show names for 3-column (square) layout

		return (
			<>
				{!showOptionNames && getSelectedOptionName(attribute) && (
					<p className="text-sm text-[#000] font-semibold mb-2">
						Selected Options: <span className='text-base text-[#CDA26E] font-semibold'>{getSelectedOptionName(attribute)}</span>
					</p>
				)}

				<OptionsGrid columns={columns}>
					{attribute.options
						.filter(x => x.enabled)
						.map(option => (
							<OptionCardWrapper key={option.id}>
								<OptionCard
									selected={option.selected}
									isRound={isRound}
									columns={columns}
									onClick={() => selectOption(option.id)}
								>
									{option.imageUrl ? (
										<OptionImageContainer isRound={isRound}>
											<img src={option.imageUrl} alt={T._d(option.name)} />
										</OptionImageContainer>
									) : (
										<ColorSwatch isRound={isRound} />
									)}
								</OptionCard>
								{showOptionNames && <OptionLabel columns={columns}>{T._d(option.name)}</OptionLabel>}
							</OptionCardWrapper>
						))}
				</OptionsGrid>
			</>
		);
	};

	return (
		<DesktopRightSidebarContainer>
			<AttributesContainer key={selectedAttributeId}>
				<TopBar />
				<div className="grid lg:grid-cols-3 grid-cols-1 gap-3 py-3 ">
					{actualGroups &&
						!(actualGroups.length === 1 && actualGroups[0].name.toLowerCase() === 'other') &&
						actualGroups.map((group) => {
							if (group)
								return (
									<div className="flex flex-col items-center text-black">
										<GroupItem
											key={group.guid}
											className={'group-item' + (group.id === selectedGroupId ? ' selected' : '')}
											onClick={() => handleGroupSelection(group.id)}
										>
											<GroupIcon
												loading='lazy'
												src={
													group.imageUrl && group.imageUrl !== ''
														? group.id === -3
															? savedCompositionsIcon
															: group.imageUrl
														: group.id === -2
															? textIcon
															: star
												}
											/>
										</GroupItem>
										<span className={`font-bold text-sm ${group.id === selectedGroupId ? 'text-[#121715] ' : 'text-[#000000B2]'}`}>{group.name ? T._d(group.name) : T._('Customize', 'Composer')}</span>
									</div>

								);
							else return null;
						})}
				</div>

				{selectedGroupId && selectedGroupId !== -2 && selectedGroupId !== -3 && (
					<>
						{/* Attributes */}
						{selectedGroup?.direction === 0 && (
							<>
								{lastSelectedItem?.type === 'attribute' ? (
									<>
										{currentAttributes.map((attribute, index) => (
											<div key={attribute.id}>
												<h2 className='text-lg lg:text-2xl font-bold text-black py-3 mt-5 border-t-2 border-primary'>
													{T._d(attribute.name)}
												</h2>
												{renderOptionsGrid(attribute, index)}
											</div>
										))}
										<AttributeDescription>{selectedAttribute?.description}</AttributeDescription>
									</>
								) : (
									<TemplateGroup
										key={selectedTemplateGroupId}
										templateGroup={selectedTemplateGroup!}
									/>
								)}
							</>
						)}

						{selectedGroup?.direction === 1 && (
							<>
								{currentItems &&
									currentItems.map((item, itemIndex) => {
										if (!(item instanceof ThemeTemplateGroup)) {
											// Calculate attribute index for styling
											let attributeIndex = 0;
											for (let i = 0; i < itemIndex; i++) {
												if (!(currentItems[i] instanceof ThemeTemplateGroup)) {
													attributeIndex++;
												}
											}

											return (
												<ItemAccordionContainer key={'container' + item.code}>
													<ItemAccordion
														key={item.guid}
														opened={attributesOpened.get(item.id)}
														onClick={
															selectedGroup.attributesAlwaysOpened
																? () => null
																: () => handleAttributeSelection(item.id, true)
														}
													>
														<h2 className='text-lg lg:text-2xl font-bold uppercase text-black pt-3 mt-5 border-t-2 border-primary'>
															{T._d(item.name)}
														</h2>

														{!selectedGroup.attributesAlwaysOpened && (
															<ArrowIcon
																key={'accordion-icon'}
																src={
																	attributesOpened.get(item.id) ? arrowUp : arrowDown
																}
															/>
														)}
													</ItemAccordion>

													{attributesOpened.get(item.id) && (
														<>
															{renderOptionsGrid(item, attributeIndex)}
														</>
													)}
												</ItemAccordionContainer>
											);
										}
										else {
											return (
												<>
													<ItemAccordionContainer key={'container' + item.templateGroupID}>
														<ItemAccordion
															key={item.templateGroupID + 'accordion'}
															opened={attributesOpened.get(item.templateGroupID)}
															onClick={() =>
																handleTemplateGroupSelection(item.templateGroupID, true)
															}
														>
															<ItemAccordionName>{T._d(item.name)}</ItemAccordionName>

															{!selectedGroup.attributesAlwaysOpened && (
																<ArrowIcon
																	key={'accordion-icon'}
																	src={
																		attributesOpened.get(item.templateGroupID)
																			? arrowUp
																			: arrowDown
																	}
																/>
															)}
														</ItemAccordion>

														{attributesOpened.get(item.templateGroupID) && (
															<TemplateGroup
																key={selectedTemplateGroupId + 'vertical'}
																templateGroup={selectedTemplateGroup!}
															/>
														)}
													</ItemAccordionContainer>
												</>
											);
										}
									})}
							</>
						)}
					</>
				)}

				{/* Designer / Customizer */}
				{selectedGroupId === -2 && <Designer />}

				{/* Saved Compositions */}
				{draftCompositions && selectedGroupId === -3 && <DesignsDraftList />}
			</AttributesContainer>
		</DesktopRightSidebarContainer>
	);
};

export default DesktopRightSidebar;