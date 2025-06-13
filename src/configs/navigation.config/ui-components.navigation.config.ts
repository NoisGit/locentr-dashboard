import { UI_COMPONENTS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const uiComponentNavigationConfig: NavigationTree[] = [
    {
        key: 'uiComponent',
        path: '',
        title: 'Ui Component',
        translateKey: 'nav.uiComponents',
        icon: 'uiComponents',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        meta: {
            horizontalMenu: {
                layout: 'tabs',
                columns: 2,
            },
        },
        subMenu: [
            {
                key: 'uiComponent.forms',
                path: '',
                title: 'Forms',
                translateKey: 'nav.uiComponentsForms.forms',
                icon: 'forms',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.uiComponentsForms.formsDesc',
                        label: 'Form elements',
                    },
                },
                subMenu: [
                    {
                        key: 'uiComponent.forms.checkbox',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/checkbox`,
                        title: 'Checkbox',
                        translateKey: 'nav.uiComponentsForms.checkbox',
                        icon: 'uiFormsCheckbox',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.checkboxDesc',
                                label: 'Tickable checkboxes',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.datePicker',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/date-picker`,
                        title: 'Date picker',
                        translateKey: 'nav.uiComponentsForms.datePicker',
                        icon: 'uiFormsDatepicker',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.datePickerDesc',
                                label: 'Select dates',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.formControl',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/form-control`,
                        title: 'Form control',
                        translateKey: 'nav.uiComponentsForms.formControl',
                        icon: 'uiFormsFormControl',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.formControlDesc',
                                label: 'Form control elements',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.input',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/input`,
                        title: 'Input',
                        translateKey: 'nav.uiComponentsForms.input',
                        icon: 'uiFormsInput',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.inputDesc',
                                label: 'Text inputs',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.inputGroup',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/input-group`,
                        title: 'Input Group',
                        translateKey: 'nav.uiComponentsForms.inputGroup',
                        icon: 'uiFormsInputGroup',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.inputGroupDesc',
                                label: 'Grouped inputs',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.radio',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/radio`,
                        title: 'Radio',
                        translateKey: 'nav.uiComponentsForms.radio',
                        icon: 'uiFormsRadio',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.radioDesc',
                                label: 'Radio buttons',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.segment',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/segment`,
                        title: 'Segment',
                        translateKey: 'nav.uiComponentsForms.segment',
                        icon: 'uiFormsSegment',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.segmentDesc',
                                label: 'Input segments',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.select',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/select`,
                        title: 'Select',
                        translateKey: 'nav.uiComponentsForms.select',
                        icon: 'uiFormsSelect',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.selectDesc',
                                label: 'Dropdown selects',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.slider',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/slider`,
                        title: 'Slider',
                        translateKey: 'nav.uiComponentsForms.slider',
                        icon: 'uiFormsSlider',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.sliderDesc',
                                label: 'Sliders',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.switcher',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/switcher`,
                        title: 'Switcher',
                        translateKey: 'nav.uiComponentsForms.switcher',
                        icon: 'uiFormsSwitcher',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.switcherDesc',
                                label: 'Toggle switches',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.timeInput',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/time-input`,
                        title: 'Time Input',
                        translateKey: 'nav.uiComponentsForms.timeInput',
                        icon: 'uiFormsTimePicker',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.timeInputDesc',
                                label: 'Time inputs',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.upload',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/upload`,
                        title: 'Upload',
                        translateKey: 'nav.uiComponentsForms.upload',
                        icon: 'uiFormsUpload',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey:
                                    'nav.uiComponentsForms.uploadDesc',
                                label: 'File uploaders',
                            },
                        },
                        subMenu: [],
                    },
                ],
            },
        ],
    },
]

export default uiComponentNavigationConfig
