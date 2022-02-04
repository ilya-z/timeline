import React, { useEffect, useRef, useState } from "react";
import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import { BaseProvider, DarkTheme } from "baseui";
import { Checkbox } from "baseui/checkbox";
import { useStyletron } from "baseui";
import { Slider } from "baseui/slider";
import styled from "styled-components";
import { H5, Paragraph4, Label1 } from "baseui/typography";
import StorageService from "../content/services/StorageService";

const engine = new Styletron();

const Container = styled.div`
  flex-direction: column;
  display: flex;
  padding: 0 20px;
  justify-content: space-between;
  height: 400px;
`;

const Content = styled.div`
  height: 100%;
`;

const Label1Styled = styled(Label1)`
  margin: 40px 0;
`;

interface SliderProps {
  transparency: number[];
  setTransparency: (value: number[]) => void;
}

const SliderStyled = ({ transparency, setTransparency }: SliderProps) => {
  const [css, theme] = useStyletron();

  return (
    <Slider
      value={transparency}
      step={10}
      min={0}
      max={100}
      onChange={({ value }) => value && setTransparency(value)}
      overrides={{
        Root: {
          style: {
            marginTop: "24px",
          },
        },
        InnerThumb: () => null,
        ThumbValue: ({ $value }) => (
          <div
            className={css({
              position: "absolute",
              top: `-${theme.sizing.scale900}`,
              ...theme.typography.font200,
              backgroundColor: "transparent",
            })}
          >
            {$value}%
          </div>
        ),
        TickBar: ({ $min, $max }) => (
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: theme.sizing.scale600,
              paddingLeft: theme.sizing.scale600,
              paddingBottom: theme.sizing.scale400,
              paddingTop: theme.sizing.scale200,
              ...theme.typography.font100,
            })}
          >
            <div>{$min}%</div>
            <div>{$max}%</div>
          </div>
        ),
      }}
    />
  );
};

const App = () => {
  const storageService = useRef<StorageService>();

  const [showButtonChecked, setShowButtonChecked] = useState(true);
  const [transparency, setTransparency] = useState([60]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    storageService.current = new StorageService();

    storageService.current.getSettings().then((settings) => {
      setShowButtonChecked(settings.showButton);
      setTransparency([settings.transparency || 60]);
      setInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (initialized) {
      storageService.current?.setTransparencyAndButton(
        transparency[0],
        showButtonChecked
      );
    }
  }, [showButtonChecked, transparency]);

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={DarkTheme}>
        <Container>
          <H5>Settings</H5>
          <Content>
            {initialized && (
              <>
                <Checkbox
                  checked={showButtonChecked}
                  onChange={() => setShowButtonChecked(!showButtonChecked)}
                >
                  Display 'Show/Hide comments' button on the player toolbar
                </Checkbox>
                <Label1Styled>Transparency</Label1Styled>
                <SliderStyled
                  transparency={transparency}
                  setTransparency={setTransparency}
                />
              </>
            )}
          </Content>
          <Paragraph4>v1.0.3</Paragraph4>
        </Container>
      </BaseProvider>
    </StyletronProvider>
  );
};

export default App;
