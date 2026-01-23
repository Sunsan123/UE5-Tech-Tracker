import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BilingualBlock from "../components/BilingualBlock";
import { buildLogs, type BuildLog } from "../data/build-logs";

const LogsPage = () => {
  const latest = buildLogs[0];
  const statusLabel = (status: BuildLog["status"]) => {
    switch (status) {
      case "success":
        return "成功";
      case "partial":
        return "部分失败";
      case "failed":
        return "失败";
      default:
        return "未知";
    }
  };

  const renderTelemetry = (
    label: string,
    telemetry: BuildLog["ai"],
    logId: string,
  ) => (
    <Stack spacing={0.5}>
      <Typography variant="body2">
        {label}：成功 {telemetry.success} · 失败 {telemetry.failed}
      </Typography>
      {telemetry.failed > 0 ? (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">{label} 失败日志</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {telemetry.errors.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                暂无错误样例
              </Typography>
            ) : (
              <Stack spacing={0.5}>
                {telemetry.errors.map((error, index) => (
                  <Typography key={`${logId}-${label}-${index}`} variant="body2">
                    - {error}
                  </Typography>
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      ) : null}
    </Stack>
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h4">构建日志</Typography>
      <BilingualBlock
        zh="展示最近一次构建状态与失败样例。"
        en="Show the latest build status and recent failure samples."
      />
      {!latest ? (
        <Typography variant="body2" color="text.secondary">
          暂无构建记录，请先运行流水线。
        </Typography>
      ) : (
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body1">
                最近一次构建：{statusLabel(latest.status)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                开始时间：{latest.started_at}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                完成时间：{latest.finished_at ?? "进行中"}
              </Typography>
              {latest.incomplete_data ? (
                <Typography variant="body2" color="warning.main">
                  数据可能不完整（截断/配额耗尽）。
                </Typography>
              ) : null}
              {renderTelemetry("AI 生成", latest.ai, latest.id)}
              {renderTelemetry("网页搜索", latest.search, latest.id)}
            </Stack>
          </CardContent>
        </Card>
      )}
      {buildLogs.map((log) => (
        <Card key={log.id}>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={statusLabel(log.status)} size="small" />
                <Chip label={log.started_at} size="small" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                步骤概览：
              </Typography>
              <Stack spacing={0.5}>
                {log.steps.map((step) => (
                  <Typography key={step.name} variant="body2">
                    - {step.name} · {statusLabel(step.status)}
                  </Typography>
                ))}
              </Stack>
              {renderTelemetry("AI 生成", log.ai, log.id)}
              {renderTelemetry("网页搜索", log.search, log.id)}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">
                    错误样例（前 20 条）
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {log.error_samples.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      暂无
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {log.error_samples.map((error, index) => (
                        <Typography key={`${log.id}-${index}`} variant="body2">
                          - {error}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </AccordionDetails>
              </Accordion>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default LogsPage;
