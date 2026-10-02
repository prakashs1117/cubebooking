/**
 * CustomText Component Tests
 * Tests for the custom text component and its variants
 */

import React from 'react';
import renderer from 'react-test-renderer';
import {
  CustomText,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  BodyText,
  CaptionText,
  ButtonText,
  SubtitleText,
} from '@components/common/CustomText';

// Mock the font utilities
jest.mock('@utils/fonts', () => ({
  getFontStyle: jest.fn(() => ({
    fontFamily: 'System',
    fontSize: 16,
  })),
  combineWithFontStyle: jest.fn((variant: string, styles: any) => ({
    fontFamily: 'System',
    fontSize: 16,
    ...styles,
  })),
}));

describe('CustomText Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CustomText', () => {
    it('renders correctly with default props', () => {
      const tree = renderer.create(<CustomText>Test Text</CustomText>).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom variant', () => {
      const tree = renderer
        .create(<CustomText variant="h1">Heading Text</CustomText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom color', () => {
      const tree = renderer
        .create(<CustomText color="#FF0000">Red Text</CustomText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom fontSize', () => {
      const tree = renderer
        .create(<CustomText fontSize={20}>Large Text</CustomText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('passes through additional props', () => {
      const onPress = jest.fn();
      const tree = renderer
        .create(
          <CustomText onPress={onPress} testID="custom-text">
            Pressable Text
          </CustomText>,
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('combines custom styles with font styles', () => {
      const customStyle = { marginTop: 10, textAlign: 'center' as const };
      const tree = renderer
        .create(<CustomText style={customStyle}>Styled Text</CustomText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Text Variants', () => {
    it('renders Heading1 correctly', () => {
      const tree = renderer.create(<Heading1>Main Heading</Heading1>).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders Heading2 correctly', () => {
      const tree = renderer.create(<Heading2>Sub Heading</Heading2>).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders Heading3 correctly', () => {
      const tree = renderer
        .create(<Heading3>Section Heading</Heading3>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders Heading4 correctly', () => {
      const tree = renderer.create(<Heading4>Minor Heading</Heading4>).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders BodyText correctly', () => {
      const tree = renderer
        .create(<BodyText>Body content text</BodyText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders CaptionText correctly', () => {
      const tree = renderer
        .create(<CaptionText>Caption text</CaptionText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders ButtonText correctly', () => {
      const tree = renderer
        .create(<ButtonText>Button Label</ButtonText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders SubtitleText correctly', () => {
      const tree = renderer
        .create(<SubtitleText>Subtitle content</SubtitleText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Variant Props Override', () => {
    it('allows color override on variants', () => {
      const tree = renderer
        .create(<Heading1 color="#0000FF">Blue Heading</Heading1>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('allows fontSize override on variants', () => {
      const tree = renderer
        .create(<BodyText fontSize={18}>Large Body Text</BodyText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('allows style override on variants', () => {
      const customStyle = { fontWeight: 'bold' as const };
      const tree = renderer
        .create(<CaptionText style={customStyle}>Bold Caption</CaptionText>)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const tree = renderer.create(<CustomText />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('handles null children', () => {
      const tree = renderer.create(<CustomText>{null}</CustomText>).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('handles number children', () => {
      const tree = renderer.create(<CustomText>{42}</CustomText>).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('handles boolean children', () => {
      const tree = renderer.create(<CustomText>{false}</CustomText>).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
